describe("Tradeables management", () => {
  it("creates, updates, and deletes a tradeable", () => {
    cy.intercept("GET", "/api/tradeables?page=1", {
      statusCode: 200,
      body: { count: 0, elements: [] },
    }).as("getTradeables");

    cy.intercept("POST", "/api/tradeables", {
      statusCode: 201,
      body: {
        id: 1,
        name: "Bitcoin",
        symbol: "BTC",
        tradable_type: "CryptoCurrency",
      },
    }).as("createTradeable");

    cy.intercept("PATCH", "/api/tradeables/1", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Bitcoin Spot",
        symbol: "BTC",
        tradable_type: "CryptoCurrency",
      },
    }).as("updateTradeable");

    cy.intercept("DELETE", "/api/tradeables/1", {
      statusCode: 204,
      body: "",
    }).as("deleteTradeable");

    cy.visit("/");
    cy.wait("@getTradeables");

    // Create
    cy.get("#name").type("Bitcoin");
    cy.get("#symbol").type("BTC");
    cy.get("#tradable_type").select("CryptoCurrency");
    cy.contains("button", "Crear").click();

    cy.wait("@createTradeable")
      .its("request.body")
      .should("deep.equal", {
        name: "Bitcoin",
        symbol: "BTC",
        tradable_type: "CryptoCurrency",
      });

    cy.get(".tradeable-count").should("have.text", "1");
    cy.contains(".tradeable-name", "Bitcoin").should("be.visible");
    cy.contains(".tradeable-symbol", "BTC").should("be.visible");
    cy.get("#name").should("have.value", "");

    // Update
    cy.contains("button", "Editar").click();
    cy.get("#name").should("have.value", "Bitcoin").clear().type("Bitcoin Spot");
    cy.contains("button", "Actualizar").click();

    cy.wait("@updateTradeable")
      .its("request.body")
      .should("deep.equal", {
        name: "Bitcoin Spot",
        symbol: "BTC",
        tradable_type: "CryptoCurrency",
      });

    cy.contains(".tradeable-name", "Bitcoin Spot").should("be.visible");
    cy.contains("button", "Crear").should("be.visible");

    // Delete
    cy.contains("button", "Eliminar").click();
    cy.wait("@deleteTradeable");

    cy.get(".tradeable-count").should("have.text", "0");
    cy.contains(".tradeable-name", "Bitcoin Spot").should("not.exist");
  });
});
