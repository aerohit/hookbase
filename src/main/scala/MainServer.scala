import io.backchat.hookup._
import org.json4s._
import org.json4s.jackson.JsonMethods._
import scala.collection.mutable


object MainServer extends App {
  val store   = mutable.Map[String, String]()
  val clients = mutable.ListBuffer[HookupServerClient]()

  def addToStore(data: String) = {
    val id = java.util.UUID.randomUUID.toString
    store(id) = data
    id
  }

  def removeFromStrore(id: String) = store -= id

  def getAllInStore = store.map {
    case (key: String, value: String) => (key, JString(value))
  }.toList

  def addClient(client: HookupServerClient) = clients += client

  def removeClient(client: HookupServerClient) = clients -= client

  def notifyAllClients = clients.foreach { client =>
    client.send(JsonMessage(JObject(("response", JString("dataChanged")) :: getAllInStore)))
  }

  def handleRequest(params: List[(String, JValue)]) = {
    params match {
      case List(("request", JString("push")), ("data", JString(data))) =>
        val id = addToStore(data)
        notifyAllClients
        JsonMessage(JObject(List(("id", JString(id)), ("response", JString("pushed")), ("data", JString(data)))))
      case List(("request", JString("remove")), ("id", JString(id))) =>
        removeFromStrore(id)
        notifyAllClients
        JsonMessage(JObject(List(("id", JString(id)), ("response", JString("removed")))))
      case List(("request", JString("getAll"))) =>
        JsonMessage(JObject(("response", JString("respondingAll")) :: getAllInStore))
      case unhandled =>
        println("UNHANDLED: " + unhandled)
        JsonMessage(JObject(("response", JString("error"))))
    }
  }

  val server = HookupServer(8125) {
    new HookupServerClient {
      def receive = {
        case c @ Connected =>
          println("Established new connection")
          addClient(this)

        case d @ Disconnected(_) =>
          println("Disconnected")
          removeClient(this)

        case m @ Error(exOpt) =>
          System.err.println("ERROR: " + m)
          exOpt foreach { _.printStackTrace(System.err) }

        case m @ JsonMessage(JObject(params)) =>
          println(pretty(render(m.content)))
          send(handleRequest(params))
      }
    }
  }

  server.start
}
