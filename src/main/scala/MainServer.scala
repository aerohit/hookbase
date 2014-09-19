import io.backchat.hookup._


object MainServer extends App {
  (HookupServer(8125) {
    new HookupServerClient {
      def receive = {
        case TextMessage(text) =>
          println(text)
          send(text)
      }
    }
  }).start
}
