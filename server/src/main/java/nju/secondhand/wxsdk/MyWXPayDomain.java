package nju.secondhand.wxsdk;

public class MyWXPayDomain implements IWXPayDomain {
    @Override
    public void report(String domain, long elapsedTimeMillis, Exception ex) {
        System.out.println(domain+":"+ex);
    }

    @Override
    public DomainInfo getDomain(WXPayConfig config) {
        return new DomainInfo("api.mch.weixin.qq.com", true);
    }
}
