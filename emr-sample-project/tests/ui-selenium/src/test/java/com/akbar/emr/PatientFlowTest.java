package com.akbar.emr;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class PatientFlowTest {
    private WebDriver driver;
    private String baseUrl = System.getProperty("baseUrl", "http://localhost:8080");

    @BeforeClass
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) driver.quit();
    }

    @Test
    public void canCreatePatientAndSeeInTable() throws InterruptedException {
        driver.get(baseUrl);
        driver.findElement(By.id("firstName")).sendKeys("Test");
        driver.findElement(By.id("lastName")).sendKeys("User");
        driver.findElement(By.cssSelector("button[onclick='createPatient()']")).click();
        Thread.sleep(500); // small wait for API

        driver.findElement(By.xpath("//div[h2[text()='Patients']]//button")).click();
        Thread.sleep(500);

        WebElement tbody = driver.findElement(By.cssSelector("#patientTable tbody"));
        String tableText = tbody.getText();
        Assert.assertTrue(tableText.contains("Test User"), "Patient table should contain the created patient.");
    }
}
