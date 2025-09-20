FROM public.ecr.aws/compose-x/amazoncorretto:17.alpine-amd64

WORKDIR /app

COPY . .

RUN apk add --no-cache curl

RUN curl --location --output /app/dd-java-agent.jar 'https://github.com/DataDog/dd-trace-java/releases/download/v1.15.3/dd-java-agent.jar'

RUN ./gradlew build -x test

EXPOSE 8080

CMD ["java","-javaagent:/app/dd-java-agent.jar", "-jar", "./build/libs/microservice-maintenence-uptime-0.0.1-SNAPSHOT.jar"]

