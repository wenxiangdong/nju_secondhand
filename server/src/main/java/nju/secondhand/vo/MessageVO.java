package nju.secondhand.vo;

import lombok.Data;

/**
 * @author cst
 */
@Data
public class MessageVO extends VO {
    String senderID;
    String senderName;

    String receiverID;
    String receiverName;

    String content;

    Long time;
    Boolean read;
}
