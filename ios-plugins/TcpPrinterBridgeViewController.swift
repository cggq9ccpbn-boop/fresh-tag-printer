import UIKit
import Capacitor

@objc(TcpPrinterBridgeViewController)
public class TcpPrinterBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(TcpPrinterPlugin())
    }
}
