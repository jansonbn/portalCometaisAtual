<template>
  <div id="addcost">

    <b-modal
      v-model="modalShow"
      :title="titleVmodal"
      :header-bg-variant="headerBgVariant">
      <b-form>
        <b-row>
          <b-col>
            <label>
              <p>Solicitante: <b> {{ requisitante }} </b><br />
                Data da Solicitação: {{ dataRequisicao }}
              </p>
              Observação: {{ obs }}
            </label>
          </b-col>
        </b-row>
      </b-form>
      <template #modal-footer>
       <b-button size="sm" variant="primary" @click="showMsgAprovacao" class="mr-2">Aprovar</b-button>
       <b-button disabled size="sm" variant="danger" @click="showMsgRecusar" class="mr-2">Recusar</b-button>
       <b-button size="sm" @click="close()">Fechar</b-button>
      </template>
    </b-modal>
    <h1>Aprovação de custos adicionais</h1>
    <b-form-group label="Pesquisar:" label-for="weight-search">
      <b-form-input
        id="weight-search"
        type="text"
        v-model="keyword"
        placeholder="Procurar aprovação"
      />
    </b-form-group>
    <b-table
      small
      fixed
      hover
      striped
      :items="items"
      :fields="fields"
      :keyword="keyword"
    >
      <template v-slot:cell(actions)="data">
        <b-button variant="success" @click="approval(data.item)" class="mr-2" title="Aprovação Direta">
          <i class="fa fa-check"></i>
        </b-button>
        <b-button variant="info" @click="load(data.item)" class="mr-2" title="Informações para Aprovação">
          <i class="fa fa-info"></i>
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
import { baseAPIUrl, showError } from "@/global";
import axios from "axios";
import { mapState } from "vuex";

export default {
  data() {
    return {
      keyword: "",
      obs: "",
      requisitante: "",
      dataRequisicao: "",
      headerBgVariant: 'light',
      titleVmodal: '',
      vehicle: "",
      modalObj: {},
      modalShow: false,
      fields: [
        { key: "id", label: "#", sortable: true },
        { key: "vid", label: "Pesagem", sortable: true },
        { key: "requester", label: "Solicitante", sortable: true },
        { key: "sname", label: "Fornecedor", sortable: true },
        { key: "datevehicle", label: "Data Pesagem", sortable: true },
        { key: "liquid", label: "Peso Líquido", sortable: true },
        { key: "original", label: "Pr. Orig.", sortable: true },
        { key: "addcost", label: "Adc. p/ kg", sortable: true },
        { key: "newcost", label: "Nv. Preço", sortable: true },
        { key: "ptotal", label: "Adic. total", sortable: true },
        { key: "actions", label: "Ações" },
      ],
      addCostsList: [],
    };
  },
  methods: {
    load(item) {
      this.modalShow = true;
      this.titleVmodal = "Ticket: " + item.vid;
      this.requisitante = item.requester;
      this.dataRequisicao = item.requestdate;
      this.obs = item.obs;
      this.modalObj = item;
    },
    modalSend() {
      this.approval(this.modalObj);
    },
    getList() {
      let url = `${baseAPIUrl}/addcostsPendings/`;
      axios
        .get(url)
        .then((res) => {
          this.addCostsList = res.data;
          this.addCostsList.forEach((item) => {
            let date = this.formatDate(item.requestdate);
            item.requestdate = date;
            date = this.formatDate(item.datevehicle);
            item.datevehicle = date;
            item.liquid = item.liquid.toFixed(2);
            item.original = (item.price / item.liquid).toFixed(2);
            item.newcost = (item.addcost + item.price / item.liquid).toFixed(2);
            item.addcost = item.addcost.toFixed(2);      

            let ptotal = item.liquid * item.addcost;
            item.ptotal = ptotal.toFixed(2);
          });
        })
        .catch(showError);
    },
    // ==> Método para aprovação na tela principal, clicando no botão "Aprovação Direta" - botão verde. 
    approval(item) {
      this.$bvModal.msgBoxConfirm('Tem certeza que deseja aprovar o ticket ' + item.vid + ' ?')
      .then(value => {
          if (value == true) {
            let addCost = {
              id: item.id,
              approver: this.user.email,
              approval: true,
              approvaldate: new Date().toISOString(),
            };
            axios.put(`${baseAPIUrl}/addcosts/${item.id}`, addCost)
            .then((resp) => {
               if (resp.status == 204) {
                this.$toasted.global.defaultSuccess();
                this.getList();
               }
            })
            .catch(showError);
            this.$bvModal.msgBoxOk('Aprovação do ticket ' + item.vid + ' Confirmada !', {
              okVariant: 'success',
              size: 'sm',
              centered: true
            })
          }
      })
    },
    formatDate(day) {
      return day.substr(8, 2) + "/" + day.substr(5, 2) + "/" + day.substr(0, 4);
    },
    reset() {
      this.modalObj = {};
      this.modalShow = false;
      this.requisitante = "";
      this.dataRequisicao = "";
      this.obs = "";
      this.addCostsList = []
      this.get();
    },
    close() {
      this.modalShow = false;
    },
    // ==> Método para validar aprovação na sub-window Informação. 
    showMsgAprovacao() {
        this.$bvModal.msgBoxConfirm('Tem certeza que deseja aprovar o ' + this.titleVmodal + ' ?')
        .then(value => {
          if (value == true) {
            this.modalShow = false;
            this.approval(this.modalObj);
            this.$bvModal.msgBoxOk('Aprovação Confirmada !', {
              okVariant: 'success',
              size: 'sm',
              centered: true
            })
          }
        })
    },
    // ==> Método Reprovar adicional de custo.
    /* showMsgRecusar() {
      this.$bvModal.msgBoxConfirm('Tem certeza que deseja aprovar o ' + this.titleVmodal + ' ?')
        .then(value => {
          if (value == true) {
            this.modalShow = false;
           // this.approval(this.modalObj);  // ==> Linha comentadada para apresentação da funcionalidade. 
            this.$bvModal.msgBoxOk('Aprovação Confirmada !', {
              okVariant: 'success',
              size: 'sm',
              centered: true
            })
          }
        })
    }, */
  },
  mounted() {
    this.user = this.$store.state.user;
    this.getList();
  },
  computed: {
    items() {
      return this.keyword
        ? this.addCostsList.filter(
            (item) =>
              item.id
                .toString()
                .toLowerCase()
                .includes(this.keyword.toLowerCase()) ||
              item.requester.toLowerCase().includes(this.keyword.toLowerCase())
          )
        : this.addCostsList;
    },
  },
};
</script>

<style>
</style>