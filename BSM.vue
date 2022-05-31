<template>
  <div class="weight-admin">
    <h2>Classificação do Material</h2>
    <b-row>
      <b-col>
        <b-button variant="warning" @click="getNumber">Gerar número</b-button>
        <b-button variant="info" @click="reset">Limpar campos</b-button>
        <!--<b-button class="ml-2" variant="info" @click="getNext">Chamar próxima</b-button>-->
      </b-col>
      <!-- Lista de fornecedores em aberto -->
            <b-col md="6" xs="6">
              <b-form-group label="Fornecedor em Aberto:" label-for="lista-espera">
                <b-form-select
                  v-model="selectedWList"            
                  :options="optionsWList"
                  v-on:change="carregarPesagem('selectedWlist')">
                  <!-- Esse bloco apenas inclui uma primeira linha na lista de opções com a opção "Selecione um fornecedor..." -->
                  <template #first>
                    <b-form-select-option :value="null" disabled>Selecione um fornecedor...</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>
      <!--<b-col>
        <b-button class="ml-2" variant=f"success" @click="confirmNext"
          >Confirma senha</b-button
        >
        <b-button class="ml-2" variant="danger" @click="jumpNext"
          >Pular</b-button
      </b-col>> -->
    </b-row>
    <b-row>
      <b-col md="12" xs="12">
        <b-form>
          <input id="weight-id" type="hidden" v-model="weight.vehicle" />
          <b-row>
            <b-col xs="6">
              <b-form-group label="Número:" label-for="weight-code">
                <b-form-input
                  id="weight-code"
                  type="text"
                  v-model="code"
                  required
                  v-on:change="validate('code')"
                  placeholder="Número da pesagem"
                />
              </b-form-group>
            </b-col>
            <b-col xs="6">
              <b-form-group label="Empresa:" label-for="weight-base">
                <b-form-select
                  v-on:change="validate('base')"
                  v-model="selectedCompany"
                  :options="optionsCompany"
                ></b-form-select>
              </b-form-group>
            </b-col>
            <b-col xs="6">
              <b-form-group label="Tipo:" label-for="weight-type">
                <b-form-select
                  v-on:change="validate('type')"
                  v-model="selected"
                  :options="options"
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row v-if="isMF">
            <b-col md="6" sm="12">
              <b-form-group label="Placa:" label-for="entrance-truck">
                <b-form-input
                  id="entrance-truck"
                  type="text"
                  v-model="truckPlate"
                  required
                  autocomplete="off"
                  placeholder="Informe a placa do caminhão"
                  :formatter="formatter"
                />
              </b-form-group>
            </b-col>
            <b-col md="6" sm="12">
              <b-form-group label="Motorista:" label-for="entrance-driver">
                <b-form-input
                  id="entrance-driver"
                  type="text"
                  v-model="truckDriver"
                  required
                  autocomplete="off"
                  placeholder="Informe o nome do motorista"
                  :formatter="formatter"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col xs="6">
              <b-form-group label="Fornecedor:" label-for="weight-supplier">
                <b-form-input
                  id="weight-supplier"
                  type="text"
                  v-model="supplier"
                  required
                  v-on:change="validate('supplier')"
                  placeholder="Informe o CPF/CNPJ do fornecedor"
                  list="supplier"
                  :readonly="isUpdate"
                />
                <datalist id="supplier">
                  <option
                    v-for="supplier in suppliers"
                    :key="supplier.registration"
                    :value="supplier.registration"
                  ></option>
                </datalist>
              </b-form-group>
            </b-col>
            <b-col xs="6">
              <b-form-group label="Nome:" label-for="entrance-name">
                <b-form-input
                  id="entrance-name"
                  type="text"
                  v-model="suppliername"
                  required
                  v-on:change="validate('supplierName')"
                  placeholder="Informe o nome do fornecedor"
                  list="supplierName"
                  :readonly="isUpdate"
                />
                <datalist id="supplierName">
                  <option
                    v-for="supplier in suppliers"
                    :key="supplier.registration"
                    :value="supplier.fullname"
                  ></option>
                </datalist>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col md="6" xs="12">
              <b-form-group label="Tara Kg:" label-for="rate-tare">
                <b-form-input
                  id="rate-tare"
                  type="number"
                  v-model="tare"
                  required
                  min="0"
                  placeholder="Informa a tara"
                  v-on:change="calculate()"
                />
              </b-form-group>
            </b-col>
            <b-col md="6" xs="12">
              <b-form-group label="Perda %:" label-for="rate-loss">
                <b-form-input
                  id="rate-loss"
                  min="0"
                  type="number"
                  v-model="loss"
                  placeholder="Informa a perda"
                  v-on:change="calculate()"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col md="2">
              <b-button variant="info" @click="weightin">Pesar</b-button>
            </b-col>
            <b-col md="4">
              <b-form-select
                v-model="selectedScale"
                :options="optionsScale"
              ></b-form-select>
            </b-col>
            <b-col md="6">
              <b-form-input
                type="text"
                v-model="scaleResult"
                v-on:change="calculate()"
                disabled
              />
            </b-col>
          </b-row>
          <b-row>
            <b-col md="6">
              <b-form-group label="Perda Kg:" label-for="rate-element">
                <b-form-input
                  min="0"
                  type="number"
                  v-model="liquidLoss"
                  v-on:change="calcLoss()"
                />
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Peso Líq.:" label-for="rate-element">
                <b-form-input type="text" v-model="liquidWeight" readonly />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col xs="3">
              <b-form-group label="Material:" label-for="rate-element">
                <b-form-input
                  id="rate-element"
                  type="text"
                  v-model="weight.element"
                  required
                  v-on:change="validate('element')"
                  placeholder="Informe o material"
                  list="elements"
                />
                <datalist id="elements">
                  <option
                    v-for="element in elementList"
                    :key="element.id"
                    :value="element.fullname"
                  ></option>
                </datalist>
              </b-form-group>
            </b-col>
            <b-col xs="9">
              <b-form-group label="Observação" label-for="entrance-obs">
                <b-form-textarea
                  id="entrance-obs"
                  v-model="obs"
                  placeholder="Observação"
                  rows="3"
                  max-rows="3"
                  no-resize
                ></b-form-textarea>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col xs="12">
              <b-button variant="primary" v-if="mode === 'save'" @click="save"
                >Nova Pesagem</b-button
              >
              <b-button
                variant="danger"
                v-if="mode === 'remove'"
                @click="remove"
                >Excluir</b-button
              >
              <b-button
                class="ml-2"
                variant="danger"
                v-if="code && weighings.length > 0"
                @click="close"
                >Encerrar</b-button
              >
              <b-button class="ml-2" @click="reset">Cancelar</b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-col>
    </b-row>
    <hr />
    <b-table small hover striped :items="weighings" :fields="weightsFields">
      <template v-slot:cell(actions)="data">
        <b-button
          variant="danger"
          @click="loadRate(data.item, 'remove')"
          class="mr-2"
          title="Remover item">
          <i class="fa fa-eraser"></i>
        </b-button>
      </template>
    </b-table>
    <b-row>
      <b-col>
        <h3>Peso Bruto total: {{ total }}</h3>
      </b-col>
      <b-col>
        <h3>Peso Líquido total: {{ totalLiq }}</h3>
      </b-col>
      <b-col>
        <TicketBSM ref="bsmticket" v-if="isPrint" :id="id" />
        <RateTicket
          ref="rticket"
          v-show="false"
          :sname="suppliername"
          :supplierRegistration="supplier"
          :plate="truckPlate"
          :weight1="scaleResult"
          :collect="''"
          :id="code"
          :destination="'BSM'"
        />
      </b-col>
    </b-row>
    <hr />
    {{ this.info }}
  </div>
</template>

<script>
import { baseAPIUrl, baseQueueUrl, showError } from "@/global";
import axios from "axios";

import { mapState } from "vuex";

import RateTicket from "@/components/reports/RateTicket";
import TicketBSM from "@/components/reports/TicketBSM";

export default {
  name: "Rating",
  components: { TicketBSM, RateTicket },
  data: function () {
    return {
      mask: "AAA#N##",
      info: null,
      truckPlate: "N/A",
      truckDriver: "N/A",
      id: 0,
      qty: 0,
      idVehicle: 0,
      isPrint: false,
      isUpdate: true,
      isMF: false,
      company: "",
      supplier: "",
      scaleResult: 0.0,
      mode: "save",
      code: "",
      obs: "",
      suppliername: "",
      supid: 0,
      tare: 0,
      loss: 0,
      total: 0,
      totalLiq: 0,
      liquidLoss: 0,
      liquidWeight: 0,
      keyword: "",
      elementList: {},
      weightins: [],
      weighings: [],
      weight: {},
      weights: [],
      suppliers: [],
      fields: [
        { key: "id", label: "#", sortable: true },
        { key: "sname", label: "Fornecedor", sortable: true },
        { key: "plate", label: "Placa", sortable: true },
        { key: "actions", label: "Ações" },
      ],
      selectedScale: null,
      optionsScale: [],
      scaleList: [],
      weightsFields: [
        { key: "rateid", label: "#", sortable: true },
        { key: "ename", label: "Material", sortable: true },
        { key: "weightin", label: "Peso", sortable: true },
        { key: "tare", label: "Tara", sortable: true },
        { key: "loss", label: "Perda", sortable: true },
        { key: "liquid", label: "Líquido", sortable: true },
        { key: "actions", label: "Ações" },
      ],
      vehicles: [],
      vehicleFields: [
        { key: "id", label: "#", sortable: true },
        { key: "datein", label: "Entrada", sortable: true },
        { key: "plate", label: "Placa", sortable: true },
        { key: "sname", label: "Motorista", sortable: true },
        { key: "actions", label: "Selecionar" },
      ],
      selectedCompany: null,
      optionsCompany: [
        { value: null, text: "Selecione uma opção..." },
        { value: "01", text: "Cometais" },
        { value: "85", text: "Gerencial" },
      ],
      selected: null,
      options: [
        { value: null, text: "Selecione uma opção..." },
        { value: "1", text: "Rodoviária" },
        { value: "0", text: "Avulsa" },
      ],
      selectedWList: null,
      optionsWList:[
        { value: null, text: "Selecione um fornecedor..." },
      ],
      wList:[],
    };
  },
  methods: {
      loadweights() {
      let url = `${baseAPIUrl}/suppliers`;
      axios.get(url).then((res) => {
        this.suppliers = res.data;
      });

      url = `${baseAPIUrl}/scales`;
      axios.get(url).then((res) => {
        this.scaleList = res.data;

        this.optionsScale = this.scaleList.map((e) => {
          return { value: e.api, text: e.fullname };
        });
        this.selectedScale = "bsm2";
      });
    //Começa aqui
     url = `${baseAPIUrl}/ratesToDate`;
     axios.get(url).then((res) => {
       this.wList = res.data;      
       this.optionsWList = this.wList.map((e) => {
           return { value: e.code, text: e.code + " - " + e.sname };  
       });
       this.selectedWList = null;
       this.selected = null;
     });
    },
    carregarPesagem(item) {
      if (item === "selectedWlist") {
        this.code = this.selectedWList;
        this.loadWeighings(this.code);
      }
    },
    loadWeighings(code) {
      let url = `${baseAPIUrl}/ratesByCode/${code}`;
      axios
        .get(url)
        .then((res) => {
          if (res.data.length > 0) {
            this.weighings = res.data;
            this.total = 0;
            this.totalLiq = 0;
            this.weighings.every((e) => {
              if (e.active == 1) {
                this.qty = e.qty;
                this.id = e.vehicle;
                this.total += e.weightin;
                this.totalLiq += e.liquid;
                this.isUpdate = true;
                this.supplier = e.registration;
                this.suppliername = e.sname;
                this.truck = e.plate;
                this.supid = e.supid;
                this.selected = e.type;
                this.selectedCompany = e.company;

                this.isPrint = true;
                return true;
              } else {
                this.reset();           
                this.weighings = [];
                this.selectedWlist = null;   //Limpa campo de fornecedor em Aberto.
                this.isPrint = false;  
                this.isUpdate = true;
                this.$toasted.global.defaultError({
                  msg: "Pesagem encerrada",
                });
                return false;
              }
            });

            if (this.supplier !== "" && this.supplier !== undefined) {
              axios
                .get(
                  `${baseAPIUrl}/pricesBySupplier/${this.supid}/${this.selectedCompany}`
                )
                .then((res) => {
                  if (res.data.length > 0) {
                    this.elementList = res.data;
                  } else {
                    alert("Forncedor não possui tabela de preços");
                  }
                })
                .catch(showError);
            } else {
              this.supplier = "";
              this.truck = "";
              this.supid = "";

              this.$toasted.global.defaultError({
                msg: "Obrigatório preencher o fornecedor",
              });
            }
          } else {
            this.weighings = [];
            this.selectedWlist = null;
            let code = this.code;
            this.reset();
            this.code = code;
          }
        })
        .catch(showError);
    },
    reset() {
      this.mode = "save";
      this.weight = {};
      this.weights = [];
      this.code = "";
      this.company = "";
      this.selectedCompany = null;
      this.supplier = "";
      this.suppliername = "";
      this.scaleResult = 0;
      this.liquidWeight = 0;
      this.liquidLoss = 0;
      this.tare = 0;
      this.loss = 0;
      this.total = 0;
      this.isPrint = false;
      this.id = 0;
      this.isUpdate = false;
      this.weighings = [];
      this.selected = null;
      this.totalLiq = 0;
      this.obs = "";
      this.selectedWlist = null;

      this.loadweights();
    },
    save() {
      if (this.liquidWeight <= 0) {
        this.$toasted.global.defaultError({
          msg: "Peso líquido tem que ser maior que zero",
        });
        return;
      }
      this.weight.element = this.weight.elementId;
      delete this.weight.elementId;
      this.weight.company = this.selectedCompany;
      this.weight.tare = this.tare;
      this.weight.loss = this.loss;
      this.weight.code = this.code;
      this.weight.liquid = this.liquidWeight;
      this.weight.price = this.liquidWeight * this.weight.price;

      if (!this.selected && !this.isUpdate) {
        this.$toasted.global.defaultError({
          msg: "Favor selecionar um tipo",
        });
      } else {
        if (!this.isUpdate) {
          let id = 0;
          let vehicle = {
            supplier: this.supid,
            destination: "BSM",
            transport: "N/A",
            branch: this.user.branch,
            type: this.selected,
            driver: this.truckDriver,
            truck: this.truckPlate,
            company: this.selectedCompany,
            obs: this.obs,
          };

          axios
            .post(`${baseAPIUrl}/vehicles`, vehicle)
            .then((response) => {
              id = response.data[0];
              this.weight.vehicle = id;
              this.weight.weightin = this.scaleResult;

              const method = this.weight.id ? "put" : "post";
              const id2 = this.weight.id ? `/${this.weight.id}` : "";

              delete this.weight.company;

              this.$refs.rticket.getPDF(
                this.suppliername,
                this.supplier,
                this.truckPlate,
                this.scaleResult,
                "",
                this.code,
                "BSM"
              );

              axios[method](`${baseAPIUrl}/rates${id2}`, this.weight)
                .then(() => {
                  this.$toasted.global.defaultSuccess();
                  this.reset();
                })
                .catch(showError);
            })
            .catch(showError);
        } else {
          if (this.weight.element) {
            this.weight.weightin = this.scaleResult;

            const method = this.weight.id ? "put" : "post";
            const id = this.weight.id ? `/${this.weight.id}` : "";

            this.weight.vehicle = this.id;
            delete this.weight.company;

            axios[method](`${baseAPIUrl}/rates${id}`, this.weight)
              .then(() => {
                this.$toasted.global.defaultSuccess();
                this.reset();
              })
              .catch(showError);
          }
        }
      }
    },
    calculate() {
      if (this.scaleResult != 0) {
        if (this.loss != 0) {
          this.liquidLoss = (this.scaleResult - this.tare) * (this.loss / 100);
          this.liquidWeight = this.scaleResult - this.liquidLoss - this.tare;
        } else {
          this.liquidLoss = 0;
          this.calcLoss();
        }
      }
      if (this.scaleResult == 0) {
        this.liquidWeight = 0;
      }


    },
    calcLoss() {
      if (this.liquidLoss != 0) {
        this.loss = (this.liquidLoss / (this.scaleResult - this.tare)) * 100;
        this.calculate();
      } else {
        this.loss = 0;
        this.liquidLoss = 0;
        this.liquidWeight = this.scaleResult - this.tare;
      }
    },
    close() {
      let vehicle = {
        id: this.id,
        active: 0,
        obs: this.obs
      };

      axios
        .put(`${baseAPIUrl}/vehicles/${this.id}`, vehicle)
        .then(() => {
          this.$refs.bsmticket.getData(this.id);
          this.weighings = [];
          this.$toasted.global.defaultSuccess();
          this.reset();
        })
        .catch(showError);
    },
    loadweight(weight, mode = "save") {
      this.mode = mode;
      this.weight = {
        vehicle: weight.id,
        weightin: 0,
        destination: weight.destination,
      };
      this.code = weight.code;
      this.supid = weight.supid;
      this.supplier = weight.sname;
      this.company = weight.company;

      this.loadWeighings(this.number);

      axios
        .get(
          `${baseAPIUrl}/pricesBySupplier/${this.supid}/${this.selectedCompany}`
        )
        .then((res) => {
          if (res.data.length > 0) {
            this.elementList = res.data;
          } else {
            alert("Fornecedor não possui tabela de preços");
          }
        })
        .catch(showError);
    },
    loadRate(weight, mode = "save") {
      this.mode = mode;
      this.weight = {
        rateid: weight.rateid,
        id: weight.id,
        vehicle: weight.vehicle,
        destination: weight.destination,
      };

      this.tare = weight.tare;
      this.loss = weight.loss;
      this.scaleResult =
        weight.weightin / (1 - weight.loss / 100) + weight.tare;

      this.isUpdate = true;
    },
    remove() {
      const id = this.weight.rateid;
      axios
        .delete(`${baseAPIUrl}/rates/${id}`)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.reset();
        })
        .catch(showError);
    },
    validate(field) {
      if (field === "type") {
        if (this.selected == 1) {
          this.isMF = true;
          this.truckDriver = "";
          this.truckPlate = "";
        } else {
          this.isMF = false;
          this.truckDriver = "N/A";
          this.truckPlate = "N/A";
        }
      }
      if (field === "base") {
        if (this.supid && this.selectedCompany) {
          if (this.selectedCompany == "01") {
            alert("Atenção BASE FISCAL selecionada");
          }

          this.elementList = {};

          axios
            .get(
              `${baseAPIUrl}/pricesBySupplier/${this.supid}/${this.selectedCompany}`
            )
            .then((res) => {
              if (res.data.length > 0) {
                this.elementList = res.data;
              } else {
                alert("Fornecedor não possui tabela de preços");
              }
            })
            .catch(showError);
        } else {
          this.$toasted.global.defaultError({
            msg: "Favor digitar um fornecedor válido",
          });
        }
      }
      if (field === "code") {
        this.loadWeighings(this.code);
      }
      if (field === "supplier") {
        let el = this.suppliers.find((e) => {
          return e.registration === this.supplier;
        });
        if (el === undefined) {
          this.$toasted.global.defaultError({
            msg: "Favor digitar um fornecedor válido",
          });
          this.supplier = "";
          this.weight.element = "";
          this.suppliername = "";
          this.company = "";
        } else {
          this.weight = { weightin: 0 };
          this.suppliername = el.fullname;
          this.supid = el.id;
          this.company = el.company;

          switch (el.base) {
            case "1":
              this.selectedCompany = "85";
              break;
            case "2":
              alert("Atenção BASE FISCAL selecionada");
              this.selectedCompany = "01";
              break;
            default:
              this.selectedCompany = "85";
              alert("Selecionar a empresa");
              break;
          }

          this.elementList = {};

          axios
            .get(
              `${baseAPIUrl}/pricesBySupplier/${this.supid}/${this.selectedCompany}`
            )
            .then((res) => {
              if (res.data.length > 0) {
                this.elementList = res.data;
              } else {
                alert("Fornecedor não possui tabela de preços");
              }
            })
            .catch(showError);
        }
      }
      if (field === "supplierName") {
        let el = this.suppliers.find((e) => {
          return e.fullname === this.suppliername;
        });
        if (el === undefined) {
          this.$toasted.global.defaultError({
            msg: "Favor digitar um fornecedor válido",
          });
          this.supplier = "";
          this.weight.element = "";
          this.suppliername = "";
          this.company = "";
        } else {
          this.weight = { weightin: 0 };
          this.supplier = el.registration;
          this.supid = el.id;
          this.company = el.company;

          switch (el.base) {
            case "1":
              this.selectedCompany = "85";
              break;
            case "2":
              alert("Atenção BASE FISCAL selecionada");
              this.selectedCompany = "01";
              break;
            default:
              this.selectedCompany = "85";
              alert("Selecionar a empresa");
              break;
          }

          this.elementList = {};

          axios
            .get(
              `${baseAPIUrl}/pricesBySupplier/${this.supid}/${this.selectedCompany}`
            )
            .then((res) => {
              if (res.data.length > 0) {
                this.elementList = res.data;
              } else {
                alert("Fornecedor não possui tabela de preços");
              }
            })
            .catch(showError);
        }
      }
      if (field === "element") {
        let el = this.elementList.find((e) => {
          return e.fullname === this.weight.element;
        });
        if (el === undefined) {
          this.$toasted.global.defaultError({
            msg: "Favor digitar um material cadastrado",
          });
          this.weight.element = "";
        } else {
          this.weight.elementId = el.element;
          this.weight.price = el.price;
        }
      }
    },
    weightin() {
      let scale = this.scaleList.find((e) => {
        return e.api == this.selectedScale;
      });

      let scaleAPI = `http://${
        scale.ip
      }:8080/BalancaAPI_${this.selectedScale.toUpperCase()}/rest/${
        this.selectedScale
      }/scale/${scale.port}`;

      axios
        .get(scaleAPI)
        .then((res) => {
          this.scaleResult = res.data.weight;
          this.calculate();
        })
        .catch(showError);
    },
    getNumber() {
      axios
        .get(`${baseAPIUrl}/ratesGetNext`)
        .then((res) => {
          this.weighings = [];
          this.reset();
          this.code = res.data;
        })
        .catch(showError);
    },
    getNext() {
      axios
        .get(`${baseQueueUrl}/queueFirstPending/BSM`)
        .then((res) => {
          this.code = res.data.id;
          this.suppliername = res.data.name;
          this.supplier = res.data.registration;
          this.validate("supplier");
        })
        .catch(showError);
    },
    confirmNext() {
      let queue = {
        id: this.code,
        name: this.suppliername,
        registration: this.supplier,
        caller: "BSM",
        step: 3,
      };

      axios
        .post(`${baseQueueUrl}/confirmQueue`, queue)
        .then(() => {
          this.$toasted.global.defaultSuccess();
        })
        .catch(showError);
    },
    jumpNext() {
      let queue = {
        id: parseInt(this.code),
        name: this.suppliername,
        registration: this.supplier,
        caller: "BSM",
        step: 2,
      };

      axios
        .put(`${baseQueueUrl}/queue/${queue.id}`, queue)
        .then(() => {
          this.$toasted.global.defaultSuccess();
        })
        .catch(showError);
    },
    formatter(value) {
      return value.toUpperCase();
    },
  
  },
  mounted() {
    this.loadweights();
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
    }),
    items() {
      return this.keyword
        ? this.weights.filter(
            (item) =>
              item.plate.toLowerCase().includes(this.keyword.toLowerCase()) ||
              item.sname.toLowerCase().includes(this.keyword.toLowerCase())
          )
        : this.weights;
    },
  },
};
</script>
<!-- Teste teste  -->
<style></style>
