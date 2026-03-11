import UIKit
import Capacitor

public class TcpPrinterBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(TcpPrinterPlugin())
    }
}
