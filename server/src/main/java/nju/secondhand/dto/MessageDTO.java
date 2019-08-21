package nju.secondhand.dto;

import lombok.Data;

/**
 * @author cst
 */
@Data
public class MessageDTO {
    String senderID;
    String receiverID;
    String content;
}
