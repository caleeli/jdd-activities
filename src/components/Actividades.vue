<template>
  <panel name="Diseñar proceso" class="panel-primary">
    <div id="modeler-app">
      <div class="navbar">
        <div>{{process.name}}</div>
        <div class="actions">
          <a class="btn btn-sm btn-outline-black">
            <i @click="saveBpmn" class="fa fa-save"></i> Guardar
          </a>
        </div>
      </div>
      <div class="modeler-container">
        <modeler ref="modeler" @validate="validationErrors = $event"/>
      </div>
      <statusbar>
        <template slot="secondary">Last Saved: {{lastSaved}}</template>

        <validation-status :validation-errors="validationErrors"/>
      </statusbar>
    </div>
  </panel>
</template>


<script>

import { Modeler, Statusbar, ValidationStatus } from "@processmaker/modeler";
import moment from "moment";
import {
  association,
  endEvent,
  exclusiveGateway,
  // inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  startEvent,
  task,
  scriptTask,
  pool,
  poolLane,
  textAnnotation,
  messageFlow,
  //serviceTask,
  //startTimerEvent,
  //intermediateTimerEvent
} from "@processmaker/modeler";
import bpmnExtension from "@processmaker/processmaker-bpmn-moddle/resources/processmaker.json";

// Preload the images
require("@processmaker/modeler/src/assets/toolpanel/start-event.svg");
require("@processmaker/modeler/src/assets/toolpanel/end-event.svg");
require("@processmaker/modeler/src/assets/toolpanel/task.svg");
require("@processmaker/modeler/src/assets/toolpanel/scriptTask.svg");
require("@processmaker/modeler/src/assets/toolpanel/exclusive-gateway.svg");
require("@processmaker/modeler/src/assets/toolpanel/text-annotation.svg");
require("@processmaker/modeler/src/assets/toolpanel/pool.svg");
require("@processmaker/modeler/src/assets/toolpanel/parallel-gateway.svg");
require("@processmaker/modeler/src/assets/connect-elements.svg");
require("@processmaker/modeler/src/assets/connect-artifacts.svg");
require("@processmaker/modeler/src/assets/trash-alt-solid.svg");
require("@processmaker/modeler/src/assets/highlight-shape.svg");
require("@processmaker/modeler/src/assets/lane-below.svg");
require("@processmaker/modeler/src/assets/lane-above.svg");
require("@processmaker/modeler/src/assets/script.svg");
require("@processmaker/modeler/src/assets/parallel-gateway-symbol.svg");
require("@processmaker/modeler/src/assets/message-flow.svg");

let nodeTypes = [
  startEvent,
  endEvent,
  task,
  scriptTask,
  exclusiveGateway,
  //inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  textAnnotation,
  association,
  pool,
  poolLane,
  messageFlow
  //serviceTask
];

window.ProcessMaker = {
  EventBus: {
    $emit(event, payload) {
      this[event](payload);
    },
    "modeler-start"({ loadXML }) {
      loadXML(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:pm="http://processmaker.com/BPMN/2.0/Schema.xsd" xmlns:tns="http://sourceforge.net/bpmn/definitions/_1530553328908" xmlns:xsd="http://www.w3.org/2001/XMLSchema" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://bpmn.sourceforge.net/schemas/BPMN20.xsd">
  <bpmn:process id="processId" name="Process Name" isExecutable="true">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagramId">
    <bpmndi:BPMNPlane id="BPMNPlaneId" bpmnElement="ProcessId">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`);
    },
    "modeler-init"({
      registerNode,
      registerBpmnExtension,
      registerInspectorExtension
    }) {
      /* Register basic node types */
      for (const node of nodeTypes) {
        registerNode(node);
      }

      /* Add a BPMN extension */
      registerBpmnExtension("pm", bpmnExtension);

      /* Register extension for webhooks */
      registerInspectorExtension;
    }
  },
  nodeTypes: []
};
window.ProcessMaker.nodeTypes.push(...nodeTypes);

// Set default properties for task
task.definition = function definition(moddle) {
  return moddle.create("bpmn:Task", {
    name: "New Task",
    assignment: "requester"
  });
};

export default {
  path: "/Actividades/Designer/:id",
  mixins: [window.taskMixin],
  components: {
    Modeler,
    Statusbar,
    ValidationStatus
  },
  data() {
    const errores = {};
    return {
      process: { bpmn: "", name: "Proceso" },
      data: new window.ApiObject(
        "/api/diagram/" + this.$route.params.id,
        errores
      ).loadFromAPI(),
      validationErrors: {}
    };
  },
  computed: {
    lastSaved() {
      return moment(this.process.updated_at).fromNow();
    }
  },
  mounted() {
    window.ProcessMaker.$modeler = this.$refs.modeler;
  },
  methods: {
    getTaskNotifications() {
      var notifications = {};
      this.$refs.modeler.nodes.forEach(function(node) {
        let id = node.definition.id;
        if (node.notifications !== undefined) {
          notifications[id] = node.notifications;
        }
      });
      return notifications;
    },
    saveBpmn() {
      this.$refs.modeler.toXML((err, xml) => {
        if (err) {
          window.ProcessMaker.alert(
            "There was an error saving: " + err,
            "danger"
          );
        } else {
          this.data.attributes.xml = xml;
          this.data.attributes.name = this.process.name;
          if (this.data.id) {
            this.data.putToAPI("/api/diagram/" + this.data.id).then(() => {
              //this.$router.push(this.$processCompleteRoute({accion:"completar"}));
            });
          } else {
            this.data.postToAPI("/api/diagram").then(() => {
              //this.$router.push(this.$processCompleteRoute({accion:"completar"}));
            });
          }
        }
      });
    },
    close() {
      this.$router.push(this.$processCompleteRoute({ accion: "close" }));
    },
    back() {
      this.$router.push(this.$processCompleteRoute({ accion: "back" }));
    }
  }
};
</script>

<style lang="scss" scoped>
#modeler-app {
  font-family: "Open Sans", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  .modeler-container {
    flex-grow: 1;
    overflow: hidden;
  }
  .navbar {
    font-weight: bold;
    height: 42px;
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.2em;
    background-color: #b6bfc6;

    color: white;
    border-bottom: 1px solid grey;
    padding-right: 16px;
    padding-left: 16px;
    .actions {
      button {
        border-radius: 4px;
        display: inline-block;
        padding-top: 4px;
        padding-bottom: 4px;
        padding-left: 8px;
        padding-right: 8px;
        background-color: grey;
        color: white;
        border-width: 1px;
        border-color: darkgrey;
        margin-right: 8px;
        font-weight: bold;
      }
    }
  }
}
</style>
