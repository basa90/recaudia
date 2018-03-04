sap.ui.define([
	"recaudia/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("recaudia.controller.App", {

		onInit: function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.setModel(new JSONModel(
			{
				"busy": true,
				"donorSaveBtn": true,
				"suscriptionSaveBtn": false,
				"subscriptionDeleteBtn": false,
				"donorDeleteBtn": false,
				"serviceError": {
					"status": "",
					"message": ""
				},
				"connectionError": {
					"status": "",
					"message": ""
				},
				"serviceUrl": "http://localhost:3000",
				"service": "local",
				//"serviceUrl": "http://200.35.78.10:8080"
				"local": {
					"donor": "/donor",
					"client": "/client",
					"subscription": "/subscription",
					"islogin": "/user/islogin"

				},
				"remote": {
					"findDonor": "/donor"
				}
			}), "util");

			this.setModel(new JSONModel(
			{
				"records": [],
				"donorSaveBtn": true,
				"name": "",
				"last_name": "",
				"email": "",
				"birthdate_date": "",
				"phone": "",
				"client_id": "",
				"client_name": "",
				"donorSaveDialog": true,
				"donorUpdateDialog": true
			}), "mddonor");

			this.setModel(new JSONModel(
			{
				"records": [],
				"suscriptionSaveBtn": false,
				"subscriptionSaveDialog": true,
				"subscriptionUpdateDialog": true
			}), "mdsubscription");

			this.setModel(new JSONModel(
			{
				"records": [],
				"selectItem": ""
			}), "mdclient");

			this.setModel(new JSONModel(
			{
				"user": "",
				"email": "",
				"password": ""
			}), "mdlogin");

		}

	});

});
