import io.backchat.hookup._
import org.json4s._
import org.json4s.jackson.JsonMethods._


object MainServer extends App {
  val server = HookupServer(8125) {
    new HookupServerClient {
      def receive = {
        case c @ Connected =>
          println("A new connection")
          println(c)

        case d @ Disconnected(_) =>
          println("Disconnected")
          println(d)

        case m @ Error(exOpt) =>
          System.err.println("ERROR: " + m)
          exOpt foreach { _.printStackTrace(System.err) }

        case TextMessage(text) =>
          println("Recieved text message: " + text)
          send(text + ". We agree")

        case m: JsonMessage =>
          println("Json")
          println(m)
          println(pretty(render(m.content)))
          send(m)
      }
    }
  }

  server.start
}
