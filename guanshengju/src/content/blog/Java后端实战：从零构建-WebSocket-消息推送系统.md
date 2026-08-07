---
title: "Java后端实战：从零构建 WebSocket 消息推送系统"
date: 2025-05-19
summary: "本文将带你逐步实现一个结构化、可拓展的 WebSocket 消息推送系统，涵盖：Spring Boot 3 项目配置、结构化 JSON 消息封装、消息工具类抽象等内容，适合后端开发者系统学习 WebSocket 实践。"
tags:
  - "Java / WebSocket"
  - "Java"
source: "https://www.cnblogs.com/vksfeng/p/18884255"
---
>

本文将带你逐步实现一个结构化、可拓展的 WebSocket 消息推送系统，涵盖：Spring Boot 3 项目配置、结构化 JSON 消息封装、消息工具类抽象等内容，适合后端开发者系统学习 WebSocket 实践。

---

## 🧱 一、项目初始化

### ✅ 技术栈

- Spring Boot 3.4.5

- Java 17

- WebSocket（Jakarta 标准）

- Maven

### ✅ Maven 配置（pom.xml）

```

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- WebSocket 支持 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- JSON 处理 -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>

<!-- Lombok 可选，方便开发 -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

```

---

## 🧩 二、启用 WebSocket 配置

创建 WebSocket 配置类 `WebSocketConfig`，注册自定义的 WebSocket 处理器。

```

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 允许跨域，路径为 /ws        registry.addHandler(new VksWebSocketHandler(), "/ws")
                .setAllowedOrigins("*");
    }
}

```

---

## 三、编写JWT工具类

导入依赖：

```

<!-- 支持jwt -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

```

```

  public class JwtUtils {
    private static final Key key = Keys.hmacShaKeyFor("your-256-bit-secret-your-256-bit-secret".getBytes());
    private static final long EXPIRATION = 1000 * 60 * 60;

    public static String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    public static String parseUserId(String token) throws JwtException {
        Jws<Claims> claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
        return claims.getBody().getSubject();
    }
}

```

---

## 📦 四、结构化 WebSocket 消息封装

>

WebSocket 原生只传字符串。我们用 JSON 封装消息，让前后端都更易于扩展和解析。

### ✅ 统一消息格式类：`WebSocketMessage.java`

```

@Data
public class WebSocketMessage <T> {
    private String type; //消息类型
    private T data;
}

```

---

## 🛠️ 五、发送结构化消息工具封装

为了避免在各处重复写 `session.sendMessage(...)`，我们封装一个通用工具类。

### ✅ `WebSocketMessageUtil.java`

```

@Slf4j
public class WebSocketMessageUtil {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static <T> void sendMessage(WebSocketSession session, String type, T data) {
        try {
            WebSocketMessage<T> msg = new WebSocketMessage<>();
            msg.setType(type);
            msg.setData(data);
            String json = mapper.writeValueAsString(msg);
            session.sendMessage(new TextMessage(json));
        } catch (Exception e) {
            log.error("发送 WebSocket 消息失败", e);
        }
    }
}

```

---

## 🔧 六、编写 WebSocket 核心处理器

### ✅ `CustomWebSocketHandler`（处理连接、消息、关闭）

```

@Slf4j
public class VksWebSocketHandler extends TextWebSocketHandler {
    // 保存所有连接（可按 userId 拓展）
    private static final ConcurrentHashMap<String, WebSocketSession> sessionMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery(); // ?token=xxx
        String token = null;

        if (query != null && query.startsWith("token=")) {
            token = query.split("=")[1];
        }

        if (token == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        try {
            String userId = JwtUtils.parseUserId(token);
            session.getAttributes().put("userId", userId); // 绑定用户
            sessionMap.put(userId, session);
            log.info("用户 {} 已连接", userId);
            WebSocketMessageUtil.sendMessage(session, "welcome", "连接已建立，欢迎你！");
        } catch (JwtException e) {
            log.warn("JWT 校验失败：{}", e.getMessage());
            session.close(CloseStatus.NOT_ACCEPTABLE);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("收到原始消息: {}", payload);

        ObjectMapper mapper = new ObjectMapper();
        WebSocketMessage<?> msg = mapper.readValue(payload, WebSocketMessage.class);

        switch (msg.getType()) {
            case "ping":
                WebSocketMessageUtil.sendMessage(session, "ping-pong", "pong");
//                session.sendMessage(new TextMessage("pong"));
                break;
            case "taskComplete":
                log.info("处理任务完成消息: {}", msg.getData());
                // 可转型后进行进一步业务逻辑处理
                WebSocketMessageUtil.sendMessage(session, "taskComplete", "替换为实际返回的内容");
//                session.sendMessage(new TextMessage("处理完成"));
                break;
            default:
                log.warn("未知消息类型: {}", msg.getType());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionMap.entrySet().removeIf(entry -> entry.getValue().getId().equals(session.getId()));
        log.info("连接关闭: {}", session.getId());
    }

    public static void sendToUser(String userId, String message) {
        WebSocketSession session = sessionMap.get(userId);
        if (session != null && session.isOpen()) {
            try {
                WebSocketMessageUtil.sendMessage(session, "Notice", message);
//                session.sendMessage(new TextMessage(message));
            } catch (Exception e) {
                log.error("发送失败", e);
            }
        }
    }

    public static void sendToAll(String message) {
        sessionMap.values().forEach(session -> {
            if (session.isOpen()) {
                try {
                    WebSocketMessageUtil.sendMessage(session, "Notice", message);
//                    session.sendMessage(new TextMessage(message));
                } catch (Exception e) {
                    log.error("群发失败", e);
                }
            }
        });
    }
}

```

---

## 七、业务调用扩展

根据需要，还可封装一个服务用于业务中主动推送消息

```

@Service
public class PushService {
    public void sendToUser(String userId, String message) {
        CustomWebSocketHandler.sendToUser(userId, message);
    }

    public void broadcast(String message) {
        CustomWebSocketHandler.sendToAll(message);
    }
}

```

---

## 📁 八、项目结构总览（推荐目录）

```

src/main/java/com/vksfeng/websocket/
├── config/             // Spring 配置类，如 WebSocketConfig
│   └── WebSocketConfig.java
│
├── handler/            // WebSocket 消息处理器
│   └── CustomWebSocketHandler.java
│
├── pojo/
│   └── WebSocketMessage.java
│
├── service/            // 业务服务层
│   └── PushService.java
│
└── util/               // 工具类
     └── JwtUtils.java
     └── WebSocketMessageUtil.java

```

---

## ✅ 总结

本文从零搭建了一个结构规范、逻辑清晰的 WebSocket 服务端系统，具备以下优点：

- 使用 Spring Boot 原生支持，无需额外容器

- 支持结构化 JSON 消息格式，便于前后端协作

- 解耦消息封装与业务逻辑，提升代码可维护性

- 后续易扩展：加用户身份、路由分发、分布式推送等
