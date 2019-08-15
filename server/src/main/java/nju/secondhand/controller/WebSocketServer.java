package nju.secondhand.controller;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.dto.MessageDTO;
import nju.secondhand.service.CloudService;
import nju.secondhand.util.JsonUtil;
import nju.secondhand.vo.MessageVO;
import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author cst
 */
@ServerEndpoint("/chat/{uid}")
@Component
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
        MessageDTO messageDTO = JsonUtil.fromJson(message, MessageDTO.class);

        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "addMessage")
                .put("data", messageDTO)
                .build();
        MessageVO messageVO = cloudService.invokeCloudFunction(MessageVO.class, "messageApi", map);

        WebSocketServer receiver = WEB_SOCKET_SERVERS.get(messageDTO.getReceiverID());
        if (receiver != null) {
            receiver.session.getAsyncRemote().sendText(JsonUtil.toJson(messageVO));
        }
    }
}

