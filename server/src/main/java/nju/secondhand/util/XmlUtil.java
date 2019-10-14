package nju.secondhand.util;

import lombok.Cleanup;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserFactory;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

/**
 * @author cst
 */
@UtilityClass
public class XmlUtil {
    private static final String PREFIX_XML = "<xml>";

    private static final String SUFFIX_XML = "</xml>";

    private static final String PREFIX_CDATA = "<![CDATA[";

    private static final String SUFFIX_CDATA = "]]>";

    public String xmlFormat(Map<String, String> params, boolean isAddCDATA) {
        StringBuilder builder = new StringBuilder(PREFIX_XML);
        if (!params.isEmpty()) {
            for (Entry<String, String> entry : params.entrySet()) {
                builder.append("<").append(entry.getKey()).append(">");
                if (isAddCDATA) {
                    builder.append(PREFIX_CDATA);
                    if (StringUtils.isNotEmpty(entry.getValue())) {
                        builder.append(entry.getValue());
                    }
                    builder.append(SUFFIX_CDATA);
                } else {
                    if (StringUtils.isNotEmpty(entry.getValue())) {
                        builder.append(entry.getValue());
                    }
                }
                builder.append("</").append(entry.getKey()).append(">");
            }
        }
        return builder.append(SUFFIX_XML).toString();
    }

    @SneakyThrows
    public Map<String, String> xmlParse(String xml) {
        Map<String, String> map = null;
        if (StringUtils.isNotEmpty(xml)) {
            @Cleanup InputStream inputStream = new ByteArrayInputStream(xml.getBytes());
            XmlPullParser pullParser = XmlPullParserFactory
                    .newInstance()
                    .newPullParser();
            // 为xml设置要解析的xml数据
            pullParser.setInput(inputStream, "UTF-8");
            int eventType = pullParser.getEventType();

            while (eventType != XmlPullParser.END_DOCUMENT) {
                switch (eventType) {
                    case XmlPullParser.START_DOCUMENT:
                        map = new HashMap<>();
                        break;
                    case XmlPullParser.START_TAG:
                        String key = pullParser.getName();
                        if ("xml".equals(key)) {
                            break;
                        }
                        String value = pullParser.nextText().trim();
                        map.put(key, value);
                        break;
                    case XmlPullParser.END_TAG:
                        break;
                    default:
                }
                eventType = pullParser.next();
            }
        }
        return map;
    }
}