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

        let host = NWEndpoint.Host(ip)
        let nwPort = NWEndpoint.Port(integerLiteral: UInt16(port))
        let connection = NWConnection(host: host, port: nwPort, using: .tcp)

        connection.stateUpdateHandler = { state in
            switch state {
            case .ready:
                let sendData = data.data(using: .utf8)!
                connection.send(content: sendData, completion: .contentProcessed { error in
                    if let error = error {
                        call.reject("Send error: \(error.localizedDescription)")
                    } else {
                        call.resolve(["success": true])
                    }
                    connection.cancel()
                })
            case .failed(let error):
                call.reject("Connection failed: \(error.localizedDescription)")
                connection.cancel()
            case .waiting(let error):
                call.reject("Connection waiting: \(error.localizedDescription)")
                connection.cancel()
            default:
                break
            }
        }

        connection.start(queue: .global(qos: .userInitiated))

        DispatchQueue.global().asyncAfter(deadline: .now() + 10) {
            if connection.state != .cancelled {
                connection.cancel()
                call.reject("Connection timeout")
            }
        }
    }

    @objc func testConnection(_ call: CAPPluginCall) {
        guard let ip = call.getString("ip"),
              let port = call.getInt("port") else {
            call.reject("Missing ip or port")
            return
        }

        let host = NWEndpoint.Host(ip)
        let nwPort = NWEndpoint.Port(integerLiteral: UInt16(port))
        let connection = NWConnection(host: host, port: nwPort, using: .tcp)

        connection.stateUpdateHandler = { state in
            switch state {
            case .ready:
                call.resolve(["connected": true])
                connection.cancel()
            case .failed(let error):
                call.reject("Connection failed: \(error.localizedDescription)")
                connection.cancel()
            case .waiting(let error):
                call.reject("Connection waiting: \(error.localizedDescription)")
                connection.cancel()
            default:
                break
            }
        }

        connection.start(queue: .global(qos: .userInitiated))

        DispatchQueue.global().asyncAfter(deadline: .now() + 5) {
            if connection.state != .cancelled {
                connection.cancel()
                call.reject("Connection timeout")
            }
        }
    }
}
