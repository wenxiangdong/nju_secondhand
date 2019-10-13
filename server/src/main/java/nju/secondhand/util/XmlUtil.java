package nju.secondhand.util;

import lombok.Cleanup;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import lombok.val;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author cst
 */
@UtilityClass
public class XmlUtil {
    private static final String TAG = "xml";
    private static final String START = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>";
    private static final int START_INDEX = START.length();

    @SneakyThrows
    @SuppressWarnings("unchecked")
    public String toXml(Object object) {
        Document document = DocumentBuilderFactory
                .newInstance()
                .newDocumentBuilder()
                .newDocument();

        Element root = document.createElement(TAG);

        Class objectClass = object.getClass();

        Field[] fields = objectClass.getDeclaredFields();
        for (Field field : fields) {
            String fieldName = field.getName();
            Element child = document.createElement(fieldName);
            child.setTextContent(
                    String.valueOf(field.isAccessible() ?
                            field.get(object) : objectClass.getMethod(getFieldGetName(fieldName)).invoke(object)));
            root.appendChild(child);
        }

        document.appendChild(root);

        Transformer transformer = TransformerFactory
                .newInstance()
                .newTransformer();

        DOMSource source = new DOMSource(document);
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        @Cleanup StringWriter writer = new StringWriter();
        StreamResult result = new StreamResult(writer);
        transformer.transform(source, result);
        String realXml = writer.getBuffer().toString();
        return realXml.substring(START_INDEX);
    }

    @SneakyThrows
    public <T> T fromXml(String xml, Class<T> tClass) {
        xml = START + xml;

        @Cleanup val inputStream = new ByteArrayInputStream(xml.getBytes());

        Document document = DocumentBuilderFactory
                .newInstance()
                .newDocumentBuilder()
                .parse(inputStream);

        Map<String, Object> xmlMap = new ConcurrentHashMap<>(2);

        Element root = document.getDocumentElement();
        NodeList nodeList = root.getChildNodes();
        for (int i = 0; i < nodeList.getLength(); i++) {
            Node child = nodeList.item(i);
            xmlMap.put(child.getNodeName(), child.getTextContent());
        }

        Constructor<T> constructor = tClass.getConstructor();
        T object = constructor.newInstance();
        Field[] fields = tClass.getDeclaredFields();
        for (Field field : fields) {
            String fieldName = field.getName();
            Class type = field.getType();
            if (xmlMap.containsKey(fieldName)) {
                Object value = xmlMap.get(fieldName);
                if (field.isAccessible()) {
                    field.set(object, value);
                } else {
                    Method setMethod = tClass.getMethod(getFieldSetName(fieldName), type);
                    setMethod.invoke(object, value);
                }
            }
        }
        return object;
    }

    private String getFieldSetName(String fieldName) {
        return "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
    }

    private String getFieldGetName(String fieldName) {
        return "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
    }
}
