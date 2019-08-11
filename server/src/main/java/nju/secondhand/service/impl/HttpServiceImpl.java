package nju.secondhand.service.impl;

import nju.secondhand.service.HttpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * @author cst
 */
@Service
public class HttpServiceImpl implements HttpService {
    private final RestTemplate restTemplate;

    @Autowired
    public HttpServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public <T> T get(String url, Class<T> tClass, Object... params) {
        return restTemplate.getForObject(url, tClass, params);
    }

    @Override
    public <T> T post(String url, Object object, Class<T> tClass, Object... params) {
        return restTemplate.postForObject(url, object, tClass, params);
    }
}
