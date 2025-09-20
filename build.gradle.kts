import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
	id("application")
	kotlin("jvm") version "1.9.20"
	kotlin("plugin.spring") version "1.9.20"
	id("org.springframework.boot") version "3.3.7"
	id("io.spring.dependency-management") version "1.1.4"
	id("org.jetbrains.kotlin.plugin.noarg") version "1.9.21"
	id("org.jetbrains.kotlin.plugin.allopen") version "1.9.21"
}

group = "br.com.vw.uptime"
version = "0.0.1-SNAPSHOT"


java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

repositories {
	mavenCentral()
}

val mockkVersion = "1.13.13"
val disruptorVersion = "4.0.0"

dependencies {
	val awsSdkVersion = "2.20.0"
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
	annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.3")

	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation(kotlin("noarg", version = "1.9.21"))

	// Logs
	implementation("org.springframework.boot:spring-boot-starter-log4j2")
	implementation("com.lmax:disruptor:${disruptorVersion}")

	//AWS Cloud
	implementation ("io.awspring.cloud:spring-cloud-aws-starter-dynamodb:3.0.0")
	implementation("org.apache.poi:poi-ooxml:5.4.1")

	// Spring Data, PostgreSQL
	implementation ("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation ("org.postgresql:postgresql")

	//Aws Core
	implementation("software.amazon.awssdk:s3:$awsSdkVersion")
	implementation("software.amazon.awssdk:dynamodb:$awsSdkVersion")
	implementation("software.amazon.awssdk:sts:$awsSdkVersion")
	implementation("software.amazon.awssdk:sqs:${awsSdkVersion}")

	implementation("jakarta.validation:jakarta.validation-api:3.0.2")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("com.google.code.gson:gson:2.11.0")
	implementation("com.nimbusds:nimbus-jose-jwt:9.41.2")
	implementation("com.squareup.okhttp3:okhttp:4.12.0")

	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("io.mockk:mockk:${mockkVersion}")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

}

application {
    mainClass.set("br.com.vw.uptime.schedule.ScheduleApplicationKt")
}

configurations.all {
	exclude(group = "org.springframework.boot",  module = "spring-boot-starter-logging")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
		jvmTarget.set(JvmTarget.JVM_17)
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}