sap.ui.define([
    "jquery.sap.global",
    "recaudia/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    'sap/m/Button',
    'sap/m/Text',
    'sap/ui/core/util/Export',
		'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/Spreadsheet',
    'recaudia/js/sha256'
], function(jQuery, BaseController, MessageToast, Dialog, Button, Text, Export, ExportTypeCSV, Spreadsheet,sha256) {
    "use strict";

    return BaseController.extend("recaudia.controller.Main", {
        onInit: function() {
            //this.setFragments();
            this.getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched2, this);
            this.getRouter().getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched2: function(){

        },
        _onRouteMatched: async function() {
          let isDonor = await this.onReadDonor(),
              isSubscription = await this.onReadSubscription(),
              isClient = await this.loadClient();
        },
        loadClient: function(){
          let mdclient = this.getView().getModel("mdclient"),
              mddonor = this.getView().getModel("mddonor"),
              util = this.getModel("util"),
              serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/client");
              util.setProperty("/busy/", true);
              
              fetch(serviceUrl, {
                method: 'GET'
              })
                .then(
                  function(response) {
                    if (response.status !== 200) {
                      console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                      return;
                    }

                    response.json().then(function(res) {
                      util.setProperty("/busy/", false);
                      console.log(mdclient);
                      mdclient.setProperty("/records/", res.data);
                      if(res.data.length>0){
                        mddonor.setProperty("/client_id", res.data[0].client_id);
                      }
                    });
                  }
                )
                .catch(function(err) {
                  console.log('Fetch Error: ', err);
                });

        },
        onReadDonor: function(){
          let mddonor = this.getView().getModel("mddonor"),
              util = this.getModel("util"),
              serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/donor");
              util.setProperty("/busy/", true);
              
              fetch(serviceUrl, {
                method: 'GET'
              })
                .then(
                  function(response) {
                    if (response.status !== 200) {
                      console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                      return;
                    }

                    response.json().then(function(res) {
                      util.setProperty("/busy/", false);
                      console.log(mddonor);
                      mddonor.setProperty("/records/", res.data);
                    });
                  }
                )
                .catch(function(err) {
                  console.log('Fetch Error: ', err);
                });

        },
        onReadSubscription: function(){
              let mdsubscription = this.getView().getModel("mdsubscription"),
              util = this.getModel("util"),
              serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/subscription");
              util.setProperty("/busy/", true);
              
              fetch(serviceUrl, {
                method: 'GET'
              })
                .then(
                  function(response) {
                    if (response.status !== 200) {
                      console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                      return;
                    }

                    response.json().then(function(res) {
                      util.setProperty("/busy/", false);
                      console.log(mdsubscription);
                      mdsubscription.setProperty("/records/", res.data);
                    });
                  }
                )
                .catch(function(err) {
                  console.log('Fetch Error: ', err);
                });
        },
        onNewDonor: function(oEvent) {
          let mddonor = this.getModel("mddonor");

          mddonor.setProperty("/name", "");
          mddonor.setProperty("/last_name", "");
          mddonor.setProperty("/email", "");
          mddonor.setProperty("/birthdate_date", "");
          mddonor.setProperty("/phone", "");

          mddonor.setProperty("/donorSaveDialog", true);
          mddonor.setProperty("/donorUpdateDialog", false);
          console.log(mddonor);
          this.onDonor();
        },
        onDonor: function(){
          this.formDonor = sap.ui.xmlfragment(
            "recaudia.view.DialogDonor", this);
          this.getView().addDependent(this.formDonor);
          this.formDonor.open();
        },
    onDonorCloseDialog: function(){
          this.formDonor.close();
          this.formDonor.destroy();
        },
    onDonorSaveDialog: function(oEvent) {

      //Si el registro que se desea crear es válido
      if (this._validRecord()) {

        let that = this,
            util = this.getModel("util"),
            mddonor = this.getModel("mddonor");
           /* breed_id = sap.ui.getCore().byId("breedSelect").getSelectedKey(),
            projected_quantity = sap.ui.getCore().byId("projected_quantity").mProperties.value,
            projected_date = `${pDate.getFullYear()}-${pDate.getMonth()+1}-${pDate.getDate()}`;
        console.log(projected_date);*/

      const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/donor");
      console.log(mddonor);
      fetch(serverName, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: mddonor.getProperty("/name"),
            last_name: mddonor.getProperty("/last_name"),
            email: mddonor.getProperty("/email") ,
            birthdate_date: mddonor.getProperty("/birthdate_date") ,
            phone: mddonor.getProperty("/phone") ,
            gender: sap.ui.getCore().byId("genderSelect").getSelectedKey(),
            client_id: mddonor.getProperty("/client_id") 
          })
        })
        .then(
          function(response) {
            console.log(response);
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
                var msg = `Error del Servidor \r\n ${response.status}.`;
                MessageToast.show(msg);
              return;
            }

            response.json().then(function(res) {

              that.formDonor.close();
              that.formDonor.destroy();
              var dialog = new Dialog({
                title: 'Información',
                type: 'Message',
                state: 'Success',
                content: new Text({
                  text: 'Donante guardado con éxito.'
                }),
                beginButton: new Button({
                  text: 'OK',
                  press: function() {
                    dialog.close();
                    mddonor.setProperty("/records", res.data);
                  }
                }),
                afterClose: function() {
                  dialog.destroy();
                }
              });

              dialog.open();

            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
      }
    },
    handleDeleteDonor: function(oEvent){

      let mddonor = this.getModel("mddonor"),
          util = this.getModel("util");

          util.setProperty("/donorDeleteBtn", true); 
          console.log( mddonor.getProperty(oEvent.getSource()["_aSelectedPaths"][0]));
          mddonor.setProperty("/donorSelect", mddonor.getProperty(oEvent.getSource()["_aSelectedPaths"][0]));

    },
    onDeleteDonor: function(){

      let mddonor = this.getModel("mddonor"),
          that = this,
          util = this.getModel("util"),
          name = `${mddonor.getProperty("/donorSelect/name")} ${mddonor.getProperty("/donorSelect/last_name")}`,
          donor_id = mddonor.getProperty("/donorSelect/donor_id");

          console.log(mddonor);
      let dialog = new Dialog({
        title: 'Confirmación',
        type: 'Message',
        content: new Text({
          text: `Dese eliminar ${name}`

        }),
        beginButton: new Button({
          text: 'Continuar',
          press: function () {
            dialog.close();
            that.deleteDonor(donor_id);
            that.getView().byId('donorTable').removeSelections();
            util.setProperty("/donorDeleteBtn", false); 
          }
        }),
        endButton: new Button({
          text: 'Cancelar',
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();
    },
    handleDeleteSubscription: function(oEvent){

      let mdsubscription = this.getModel("mdsubscription"),
          util = this.getModel("util");

          util.setProperty("/subscriptionDeleteBtn", true); 
          console.log( mdsubscription.getProperty(oEvent.getSource()["_aSelectedPaths"][0]));
          mdsubscription.setProperty("/subscriptionSelect", mdsubscription.getProperty(oEvent.getSource()["_aSelectedPaths"][0]));

    },
    onDeletesubscription: function(){

      let mdsubscription = this.getModel("mdsubscription"),
          that = this,
          util = this.getModel("util"),
          name = `${mdsubscription.getProperty("/subscriptionSelect/donor_name")} ${mdsubscription.getProperty("/subscriptionSelect/amount")}`,
          subscription_id = mdsubscription.getProperty("/subscriptionSelect/subscription_id");

          console.log(mdsubscription);

    let dialog = new Dialog({
        title: 'Confirmación',
        type: 'Message',
        content: new Text({
          text: `Dese eliminar la suscripcion del donante ${name} Pesos `

        }),
        beginButton: new Button({
          text: 'Continuar',
          press: function () {
            dialog.close();
            that.deleteSubscription(subscription_id);
            that.getView().byId('subscriptionTable').removeSelections();
            util.setProperty("/subscriptionDeleteBtn", false); 
          }
        }),
        endButton: new Button({
          text: 'Cancelar',
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();

    },
    deleteDonor: function(donor_id) {
      var that = this,
          util = this.getModel("util"),
          mddonor = this.getModel("mddonor"),
          serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/donor");

        fetch(serverName, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              donor_id: donor_id, 
            })

            })
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }

              response.json().then(function(res) {
                mddonor.setProperty("/records", res.data);
                util.setProperty("/busy/", true);

              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
    },
    deleteSubscription: function(subscription_id){
      console.log(subscription_id);
          let that = this,
          util = this.getModel("util"),
          mdsubscription = this.getModel("mdsubscription"),
          serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/subscription");

        fetch(serverName, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription_id: subscription_id, 
            })

            })
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }

              response.json().then(function(res) {
                mdsubscription.setProperty("/records", res.data);
                util.setProperty("/busy/", true);

              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
    },
    onViewDonor: function(oEvent){

      let mddonor = this.getView().getModel("mddonor"),
          record = JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mddonor").getObject()));

      mddonor.setProperty("/donor_id", record.donor_id);
      mddonor.setProperty("/name", record.name);
      mddonor.setProperty("/last_name", record.last_name);
      mddonor.setProperty("/email", record.email);

      let _date = record.birthdate,
          aDate =  _date.split("/"),
          date = `${aDate[0]}-${aDate[1]}-${aDate[2]}`;

      mddonor.setProperty("/birthdate_date", date);
      mddonor.setProperty("/phone", record.phone);
      mddonor.setProperty("/gender", record.gender);
      mddonor.setProperty("/client_id", record.client_id);

      mddonor.setProperty("/donorSaveDialog", false);
      mddonor.setProperty("/donorUpdateDialog", true);

      this.onDonor();
      
    },
    onDonorUpdateDialog: function(){
      let that = this,
            util = this.getModel("util"),
            mddonor = this.getModel("mddonor");

      const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/donor");
      console.log(mddonor);
      fetch(serverName, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donor_id: mddonor.getProperty("/donor_id"),
            name: mddonor.getProperty("/name"),
            last_name: mddonor.getProperty("/last_name"),
            email: mddonor.getProperty("/email") ,
            birthdate_date: mddonor.getProperty("/birthdate_date") ,
            phone: mddonor.getProperty("/phone") ,
            gender: sap.ui.getCore().byId("genderSelect").getSelectedKey(),
            client_id: mddonor.getProperty("/client_id") 
          })
        })
        .then(
          function(response) {
            console.log(response);
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
                var msg = `Error del Servidor \r\n ${response.status}.`;
                MessageToast.show(msg);
              return;
            }

            response.json().then(function(res) {

              that.formDonor.close();
              that.formDonor.destroy();
              var dialog = new Dialog({
                title: 'Información',
                type: 'Message',
                state: 'Success',
                content: new Text({
                  text: 'Donante actualizado con éxito.'
                }),
                beginButton: new Button({
                  text: 'OK',
                  press: function() {
                    dialog.close();
                    mddonor.setProperty("/records", res.data);
                  }
                }),
                afterClose: function() {
                  dialog.destroy();
                }
              });

              dialog.open();

            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });


    },
    onDonorSearch: function(oEvent){
        let aFilters = [],
        sQuery = oEvent.getSource().getValue(),
        binding = this.getView().byId("donorTable").getBinding("items");

        if (sQuery && sQuery.length > 0) {
            var filter1 = new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.Contains, sQuery);
            aFilters = new sap.ui.model.Filter([filter1]);
        }


        binding.filter(aFilters);

    },
    updateClientModel: function(){
      let mddonor = this.getView().getModel("mddonor");
         mddonor.setProperty('/client_id',sap.ui.getCore().byId("clientSelect").getSelectedKey());
    
    },
    updateDonorModel: function(){
       let mdsubscription = this.getView().getModel("mdsubscription");
         mdsubscription.setProperty('/donor_id',sap.ui.getCore().byId("donorSelect").getSelectedKey());
    },
    _validRecord: function(){
            let mddonor = this.getView().getModel("mddonor"),
                flag = true,
                that = this,
                Without_SoL = /^\d+$/,
                Without_Num = /^[a-zA-Zñáéíóú| ]*$/,
                onlyDecimals = /^[0-9]*\.?[0-9]*$/,
                emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;

            if (mddonor.getProperty("/name") === "") {
                flag = false;
                mddonor.setProperty("/name_state", "Error");
                mddonor.setProperty("/name_stateText", "El campo no puede estar vacio");
            } else if (!Without_Num.test(mddonor.getProperty("/name"))) {
                flag = false;
                mddonor.setProperty("/name_state", "Error");
                mddonor.setProperty("/name_stateText", "Solo se admiten letras");
            } else {
                mddonor.setProperty("/name_state", "None");
                mddonor.setProperty("/name_stateText", "");
            }

             if (mddonor.getProperty("/last_name") === "") {
                flag = false;
                mddonor.setProperty("/last_name_state", "Error");
                mddonor.setProperty("/last_name_stateText", "El campo no puede estar vacio");
            } else if (!Without_Num.test(mddonor.getProperty("/last_name"))) {
                flag = false;
                mddonor.setProperty("/last_name_state", "Error");
                mddonor.setProperty("/last_name_stateText", "Solo se admiten letras");
            } else {
                mddonor.setProperty("/last_name_state", "None");
                mddonor.setProperty("/last_name_stateText", "");
            }

             if (mddonor.getProperty("/email") === "") {
                flag = false;
                mddonor.setProperty("/email_state", "Error");
                mddonor.setProperty("/email_stateText", "El campo no puede estar vacio");
            } else if (!emailRegex.test(mddonor.getProperty("/email"))) {
                flag = false;
                mddonor.setProperty("/email_state", "Error");
                mddonor.setProperty("/email_stateText", "Formato invalido de email");
            } else {
                mddonor.setProperty("/email_state", "None");
                mddonor.setProperty("/email_stateText", "");
            }

             if (mddonor.getProperty("/birthdate_date") === "") {
                flag = false;
                mddonor.setProperty("/birthdate_state", "Error");
                mddonor.setProperty("/birthdate_stateText", "El campo no puede estar vacio");
            }  else {
                mddonor.setProperty("/birthdate_state", "None");
                mddonor.setProperty("/birthdate_stateText", "");
            }


             if (mddonor.getProperty("/phone") === "") {
                flag = false;
                mddonor.setProperty("/phone_state", "Error");
                mddonor.setProperty("/phone_stateText", "El campo no puede estar vacio");
            } else if (Without_Num.test(mddonor.getProperty("/phone"))) {
                flag = false;
                mddonor.setProperty("/phone_state", "Error");
                mddonor.setProperty("/phone_stateText", "Solo se admiten numeros");
            } else {
                mddonor.setProperty("/phone_state", "None");
                mddonor.setProperty("/phone_stateText", "");
            }

            return flag;
    },
    onTabSelection: function(ev){

      var util = this.getModel("util");

      var selectedKey = ev.getSource().getSelectedKey();

      if (selectedKey === "KdonorTab") {
        util.setProperty("/suscriptionSaveBtn", false);
        util.setProperty("/donorSaveBtn", true);
        this.getView().byId('donorTable').removeSelections();
      }
      if (selectedKey === "ksuscriptionTab") {
        util.setProperty("/suscriptionSaveBtn", true);
        util.setProperty("/donorSaveBtn", false);
         this.getView().byId('subscriptionTable').removeSelections();
      }

      util.setProperty("/subscriptionDeleteBtn", false);
      util.setProperty("/donorDeleteBtn", false);

    },
    onNewSuscription: function(){
      let mdsubscription = this.getModel("mdsubscription");

      mdsubscription.setProperty("/name_donor", "");
      mdsubscription.setProperty("/amount", "");
      mdsubscription.setProperty("/last_digits", "");
      mdsubscription.setProperty("/init_date", "");

      mdsubscription.setProperty("/subscriptionSaveDialog", true);
      mdsubscription.setProperty("/subscriptionUpdateDialog", false);
      console.log(mdsubscription);
      this.onSubscription();

    },
    onSubscription: function(){
      this.formSubscription = sap.ui.xmlfragment(
        "recaudia.view.DialogSubscription", this);
      this.getView().addDependent(this.formSubscription);
      this.formSubscription.open();
    },
    onSubscriptionCloseDialog: function(){
        this.formSubscription.close();
        this.formSubscription.destroy();
    },
    onSubscriptionSaveDialog: function(){
            //Si el registro que se desea crear es válido
      if (this._validRecordSubscription()) {

        let that = this,
            util = this.getModel("util"),
            mdsubscription = this.getModel("mdsubscription");

      const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/subscription");
      console.log(mdsubscription);
      fetch(serverName, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donor_id: sap.ui.getCore().byId("donorSelect").getSelectedKey(),
            amount: mdsubscription.getProperty("/amount"),
            type_card: sap.ui.getCore().byId("typeCardSelect").getSelectedKey() ,
            type_brand: sap.ui.getCore().byId("brandCardSelect").getSelectedKey(),
            last_digits: mdsubscription.getProperty("/last_digits") ,
            init_date:  mdsubscription.getProperty("/init_date")
          })
        })
        .then(
          function(response) {
            console.log(response);
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
                var msg = `Error del Servidor \r\n ${response.status}.`;
                MessageToast.show(msg);
              return;
            }

            response.json().then(function(res) {

              that.formSubscription.close();
              that.formSubscription.destroy();
              var dialog = new Dialog({
                title: 'Información',
                type: 'Message',
                state: 'Success',
                content: new Text({
                  text: 'Suscripcion guardado con éxito.'
                }),
                beginButton: new Button({
                  text: 'OK',
                  press: function() {
                    dialog.close();
                    mdsubscription.setProperty("/records", res.data);
                  }
                }),
                afterClose: function() {
                  dialog.destroy();
                }
              });

              dialog.open();

            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
      }


    },
    _validRecordSubscription: function(){
        let mdsubscription = this.getView().getModel("mdsubscription"),
            flag = true,
            that = this,
            Without_SoL = /^\d+$/,
            Without_Num = /^[a-zA-Zñáéíóú| ]*$/,
            onlyDecimals = /^[0-9]*\.?[0-9]*$/;

            if (mdsubscription.getProperty("/amount") === "") {
                flag = false;
                mdsubscription.setProperty("/amount_state", "Error");
                mdsubscription.setProperty("/amount_stateText", "El campo no puede estar vacio");
            } else if (!onlyDecimals.test(mdsubscription.getProperty("/amount"))) {
                flag = false;
                mdsubscription.setProperty("/amount_state", "Error");
                mdsubscription.setProperty("/amount_stateText", "Solo se admiten Numeros (Decimales con .)");
            } else {
                mdsubscription.setProperty("/amount_state", "None");
                mdsubscription.setProperty("/amount_stateText", "");
            }

             if (mdsubscription.getProperty("/last_digits") === "") {
                flag = false;
                mdsubscription.setProperty("/last_digits_state", "Error");
                mdsubscription.setProperty("/last_digits_stateText", "El campo no puede estar vacio");
            } else if (Without_Num.test(mdsubscription.getProperty("/last_digits"))) {
                flag = false;
                mdsubscription.setProperty("/last_digits_state", "Error");
                mdsubscription.setProperty("/last_digits_stateText", "Solo se admiten Numeros");
            } else {
                mdsubscription.setProperty("/last_digits_state", "None");
                mdsubscription.setProperty("/last_digits_stateText", "");
            }


            if (mdsubscription.getProperty("/init_date") === "") {
                flag = false;
                mdsubscription.setProperty("/init_date_state", "Error");
                mdsubscription.setProperty("/init_date_stateText", "El campo no puede estar vacio");
            }  else {
                mdsubscription.setProperty("/init_date_state", "None");
                mdsubscription.setProperty("/init_date_stateText", "");
            }

            return flag;
    },
    onViewSubscription: function(oEvent){
     let mdsubscription = this.getView().getModel("mdsubscription"),
         record = JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdsubscription").getObject()));

      console.log(record);
      mdsubscription.setProperty("/donor_id", record.donor_id);
      mdsubscription.setProperty("/amount", record.amount);
      mdsubscription.setProperty("/type_card", record.type_card);
      mdsubscription.setProperty("/brand_card", record.brand_card);
      mdsubscription.setProperty("/last_digits", record.last_digits);
      mdsubscription.setProperty("/subscription_id", record.subscription_id);

      let _date = record.init_date,
          aDate =  _date.split("/"),
          init_date = `${aDate[0]}-${aDate[1]}-${aDate[2]}`;

      mdsubscription.setProperty("/init_date", init_date);
    
      mdsubscription.setProperty("/subscriptionSaveDialog", false);
      mdsubscription.setProperty("/subscriptionUpdateDialog", true);

      this.onSubscription();
    },
    onSubscriptionUpdateDialog:function(){
      let that = this,
          util = this.getModel("util"),
          mdsubscription = this.getModel("mdsubscription");

      const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/subscription");
      console.log(mdsubscription);
      fetch(serverName, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription_id: mdsubscription.getProperty("/subscription_id"),
            donor_id: mdsubscription.getProperty("/donor_id"),
            amount: mdsubscription.getProperty("/amount"),
            type_card: mdsubscription.getProperty("/type_card"),
            brand_card: mdsubscription.getProperty("/brand_card") ,
            last_digits: mdsubscription.getProperty("/last_digits") ,
            init_date: mdsubscription.getProperty("/init_date") 
          })
        })
        .then(
          function(response) {
            console.log(response);
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
                var msg = `Error del Servidor \r\n ${response.status}.`;
                MessageToast.show(msg);
              return;
            }

            response.json().then(function(res) {

              that.formSubscription.close();
              that.formSubscription.destroy();
              var dialog = new Dialog({
                title: 'Información',
                type: 'Message',
                state: 'Success',
                content: new Text({
                  text: 'Suscripcion actualizada con éxito.'
                }),
                beginButton: new Button({
                  text: 'OK',
                  press: function() {
                    dialog.close();
                    mdsubscription.setProperty("/records", res.data);
                  }
                }),
                afterClose: function() {
                  dialog.destroy();
                }
              });

              dialog.open();

            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });


    },
    onSubscriptionSearch: function(oEvent){
        let aFilters = [],
        sQuery = oEvent.getSource().getValue(),
        binding = this.getView().byId("subscriptionTable").getBinding("items");

        if (sQuery && sQuery.length > 0) {
            var filter1 = new sap.ui.model.Filter("donor_name", sap.ui.model.FilterOperator.Contains, sQuery);
            aFilters = new sap.ui.model.Filter([filter1]);
        }
        binding.filter(aFilters);
    },
    createColumnConfig: function() {
      return [
        {
          label: 'Name',
          property: 'name'
        },
        {
          label: 'Lastname',
          property: 'last_name'
        },
        {
          label: 'Email',
          property: 'email'
        },
        {
          label: 'Birthdate',
          property: 'birthdate'
        },
        {
          label: 'Phone',
          property: 'phone'
        },
        {
          label: 'Gender',
          property: 'gender'
        },
        {
          label: 'Client',
          property: 'name_client'
        }];
    },
   onDataExport : function() {
      var aCols, aProducts, oSettings;

      aCols = this.createColumnConfig();
      aProducts = this.getModel("mddonor").getProperty("/records");

      oSettings = {
        workbook: { columns: aCols },
        dataSource: aProducts
      };

      new Spreadsheet(oSettings)
        .build()
        .then( function() {
          MessageToast.show("Export finalizado con exito");
        });


    },
    onLogin: function(){
      

      let mdlogin = this.getView().getModel("mdlogin"),
          util = this.getModel("util"),
          that =this,
          serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/islogin");
          util.setProperty("/busy/", true);
     
      fetch(serviceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _user: mdlogin.getProperty("/user"),
          password: CryptoJS.SHA256(mdlogin.getProperty("/password")).toString(CryptoJS.enc.Hex),
          email: mdlogin.getProperty("/email") 
        })
      })
        .then(
          function(response) {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
              return;
            }

            response.json().then(function(res) {
              util.setProperty("/busy/", false);
               //acceso a la aplicacion 
               console.log(res)
               if(res.data){
                  console.log("Todo es correcto");

                that.getRouter().navTo("main", {
                }, false);

               }else{
                  var msg = 'Alguno de los datos son incorrectos';
                  MessageToast.show(msg);
               }

            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error: ', err);
        });

    },
    goToLaunchpad: function(){
      let mdlogin = this.getModel("mdlogin");

          mdlogin.setProperty("/user", "");
          mdlogin.setProperty("/email", "");
          mdlogin.setProperty("/password", "");


       this.getRouter().navTo("home", {
                }, false);
    }


    });

});
