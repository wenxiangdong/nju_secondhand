package nju.secondhand.vo;

import lombok.Data;

/**
 * @author cst
 */
@Data
public class UserVO extends VO {
    String phone;
    String avatar;
    String nickname;
    Location address;
    String email;
    Long signUpTime;
    Long state;
    AccountVO account;
}
