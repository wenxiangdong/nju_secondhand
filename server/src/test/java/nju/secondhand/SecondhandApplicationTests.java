package nju.secondhand;

import com.google.gson.Gson;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SecondhandApplicationTests {


    @Test
    public void contextLoads() {
        List<String> a = new ArrayList<>();
        a.add("1");
        Map<String, Object> object = new HashMap<>();
        object.put("a", a);
        System.out.println(new Gson().toJson(object));
    }

}
