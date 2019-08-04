package nju.secondhand.controller;

import com.google.gson.Gson;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import nju.secondhand.service.CloudService;
import nju.secondhand.vo.VO;
import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author cst
 */
@ServerEndpoint("/chat/{uid}")
@Component
@EqualsAndHashCode
public class WebSocketServer {
    private final CloudService cloudService;
    private static final Map<String, WebSocketServer> WEB_SOCKET_SERVERS = new ConcurrentHashMap<>();

    private String uid;
    private Session session;

    public WebSocketServer(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("uid") String uid) {
        this.uid = uid;
        this.session = session;

        WEB_SOCKET_SERVERS.put(uid, this);
    }

    @OnClose
    public void onClose() {
        WEB_SOCKET_SERVERS.remove(this.uid);
    }

    @OnMessage
    public void onMessage(String message) {
        MessageDTO messageDTO = new Gson().fromJson(message, MessageDTO.class);

        Map<String, Object> map = new HashMap<>(2);
        map.put("$url", "addMessage");
        map.put("data", messageDTO);
        MessageVO messageVO = cloudService.invokeCloudFunction(MessageVO.class, "messageApi", map);

        WebSocketServer receiver = WEB_SOCKET_SERVERS.get(messageDTO.receiverID);
        if (receiver != null) {
            receiver.session.getAsyncRemote().sendText(new Gson().toJson(messageVO));
        }
    }
}

@ToString
class MessageDTO {
    String receiverID;
    String content;
}

@ToString
class MessageVO extends VO {
    String senderID;
    String senderName;

    String receiverID;
    String receiverName;

    String content;

    Integer time;
    Boolean read;
}
