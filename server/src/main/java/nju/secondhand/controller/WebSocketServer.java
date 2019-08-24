package nju.secondhand.controller;

import lombok.extern.log4j.Log4j2;
import nju.secondhand.dto.MessageDTO;
import nju.secondhand.service.CloudService;
import nju.secondhand.util.JsonUtil;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.util.Pair;
import nju.secondhand.vo.MessageVO;
import nju.secondhand.vo.enums.ApiType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author cst
 */
@CrossOrigin(origins = "*", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
@ServerEndpoint("/chat/{uid}")
@Component
@Log4j2
public class WebSocketServer {
    private static CloudService cloudService;
    private static final Map<String, WebSocketServer> WEB_SOCKET_SERVERS = new ConcurrentHashMap<>();

    private String uid;
    private Session session;

    @Autowired
    public void setCloudService(CloudService cloudService) {
        WebSocketServer.cloudService = cloudService;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("uid") String uid) {
        log.info("open: " + uid);
        this.uid = uid;
        this.session = session;

        WEB_SOCKET_SERVERS.put(uid, this);

        // noinspection unchecked
        List<MessageVO> messages = cloudService.invokeCloudFunction(List.class,
                MapObjectUtil.mapObject(
                        Pair.of("$url", "getUnreadMessages"),
                        Pair.of("receiverID", uid)
                ), ApiType.USER_API);
        for (MessageVO message : messages) {
            this.session.getAsyncRemote().sendText(JsonUtil.toJson(message));
        }
    }

    @OnClose
    public void onClose() {
        log.info("close: " + uid);
        WEB_SOCKET_SERVERS.remove(this.uid);
    }

    @OnError
    public void onError(Throwable throwable) {
        log.error(throwable.getLocalizedMessage());
    }

    @OnMessage
    public void onMessage(String message) {
        MessageDTO messageDTO = JsonUtil.fromJson(message, MessageDTO.class);
        messageDTO.setSenderID(uid);

        MessageVO messageVO = cloudService.invokeCloudFunction(MessageVO.class, MapObjectUtil.mapObject(
                Pair.of("$url", "addMessage"),
                Pair.of("message", messageDTO)
        ), ApiType.USER_API);

        WebSocketServer receiver = WEB_SOCKET_SERVERS.getOrDefault(messageDTO.getReceiverID(), null);
        if (receiver != null) {
            receiver.session.getAsyncRemote().sendText(JsonUtil.toJson(messageVO));

            cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                    Pair.of("$url", "readMessage"),
                    Pair.of("messageID", messageVO.get_id())
            ), ApiType.USER_API);
        }
    }
}

