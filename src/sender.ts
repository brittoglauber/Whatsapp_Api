import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js"
import { create, SocketState, Whatsapp } from "venom-bot"

export type QRcode = {
  base64Qr: string
  attempts: number
}

class Sender {
  private client: Whatsapp
  private connected: boolean
  private qr: QRcode

  get isConnected() : boolean{
    return this.connected
  }

  get qrCode(): QRcode {
    return this.qr
  }

  constructor() {
    this.initialize()
  }

  async sendText(to: string, body: string) {

    if(!isValidPhoneNumber(to, "BR")){
      throw new Error('This number is not valid !')
    }
    
    let phoneNumber = parsePhoneNumber(to, "BR")
    ?.format("E.164")
    ?.replace("+", "") as string

    phoneNumber = phoneNumber.includes("@c.us")
      ? phoneNumber
      : `${phoneNumber}@c.us`

    
    console.log("phoneNumber", phoneNumber)

    await this.client.sendText(phoneNumber , body)
  }

  private initialize() {
    const qr = (base64Qr: string, asciiQR: string, attempts: number) => {
      this.qr = { base64Qr , attempts}
    }

    const status = (statusSession: string) => {

      this.connected = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(
        statusSession
      )

    }

    const start = (client: Whatsapp) => {
      this.client = client

      client.onStateChange((state) => {
        this.connected = state === SocketState.CONNECTED
      })
    }

    create('ws-sender-dev', qr, status)
      .then((client) => start(client))
      .catch((error) => console.log(error))
  }
}

export default Sender