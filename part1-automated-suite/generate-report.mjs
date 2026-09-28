import { generate } from "multiple-cucumber-html-reporter";

generate({
  jsonDir: "cypress/reports/cucumber-json",
  reportPath: "cypress/reports/html",
  metadata: [
    { name: "Username", value: "Renato Mattos" },
    { name: "Browser", value: "Chrome (latest)" },
    { name: "Platform", value: "Windows 10" },
  ],
  customMetadata: true,
  customData: {
    projectName: "Lumu Exercise 01",
    release: "1.0.0",
    executedBy: "Renato Mattos",
    environment: "Local",
  },
});