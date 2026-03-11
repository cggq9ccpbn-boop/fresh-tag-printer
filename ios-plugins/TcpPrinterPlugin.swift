import Foundation
import Capacitor
import Network

@objc(TcpPrinterPlugin)
public class TcpPrinterPlugin: CAPPlugin {

    @objc func print(_ call: CAPPluginCall) {
        guard let ip = call.getString("ip"),
              let data = call.getString("data"),
              let port = call.getInt("port") else {
            call.reject("Missing ip, port, or data")
            return
        }

        var hasResponded = false
        let respondLock = NSLock()

        func respond(_ block: () -> Void) {
            respondLock.lock()
            defer { respondLock.unlock() }
            guard !hasResponded else { return }
            hasResponded = true
            block()
        }

        let host = NWEndpoint.Host(ip)
        let nwPort = NWEndpoint.Port(integerLiteral: UInt16(port))
        let connection = NWConnection(host: host, port: nwPort, using: .tcp)

        connection.stateUpdateHandler = { state in
            switch state {
            case .ready:
                let sendData = data.data(using: .utf8)!
                connection.send(content: sendData, completion: .contentProcessed { error in
                    if let error = error {
                        respond { call.reject("Send error: \(error.localizedDescription)") }
                    } else {
                        respond { call.resolve(["success": true]) }
                    }
                    connection.cancel()
                })
            case .failed(let error):
                respond { call.reject("Connection failed: \(error.localizedDescription)") }
                connection.cancel()
            case .waiting(let error):
                respond { call.reject("Connection waiting: \(error.localizedDescription)") }
                connection.cancel()
            default:
                break
            }
        }

        connection.start(queue: .global(qos: .userInitiated))

        DispatchQueue.global().asyncAfter(deadline: .now() + 10) {
            respond { call.reject("Connection timeout") }
            connection.cancel()
        }
    }

    @objc func testConnection(_ call: CAPPluginCall) {
        guard let ip = call.getString("ip"),
              let port = call.getInt("port") else {
            call.reject("Missing ip or port")
            return
        }

        var hasResponded = false
        let respondLock = NSLock()

        func respond(_ block: () -> Void) {
            respondLock.lock()
            defer { respondLock.unlock() }
            guard !hasResponded else { return }
            hasResponded = true
            block()
        }

        let host = NWEndpoint.Host(ip)
        let nwPort = NWEndpoint.Port(integerLiteral: UInt16(port))
        let connection = NWConnection(host: host, port: nwPort, using: .tcp)

        connection.stateUpdateHandler = { state in
            switch state {
            case .ready:
                respond { call.resolve(["connected": true]) }
                connection.cancel()
            case .failed(let error):
                respond { call.reject("Connection failed: \(error.localizedDescription)") }
                connection.cancel()
            case .waiting(let error):
                respond { call.reject("Connection waiting: \(error.localizedDescription)") }
                connection.cancel()
            default:
                break
            }
        }

        connection.start(queue: .global(qos: .userInitiated))

        DispatchQueue.global().asyncAfter(deadline: .now() + 5) {
            respond { call.reject("Connection timeout") }
            connection.cancel()
        }
    }
}
