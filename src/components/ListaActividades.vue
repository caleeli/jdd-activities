<template>
  <panel name="Selecciona un diagrama" class="panel-primary">
    <div class="row">
      <div class="col-12">
        <desktop :links="links"></desktop>
      </div>
    </div>
  </panel>
</template>

<script>
export default {
  path: "/Actividades/Lista",
  mixins: [window.taskMixin],
  computed: {
    links() {
      const links = [
          {
            text: 'Nuevo diagrama',
            description: 'Crea un nuevo diagrama BPMN',
            href: this.$processCompleteRoute({ item: 'create' }),
            icon: require("../assets/new-diagram.svg")
          },
      ];
      this.pendientes.forEach(item => {
        links.push({
          text: item.attributes.name,
          description: '(' + item.id + ')',
          href: this.$processCompleteRoute({ item: item.id }),
          icon: require("../assets/logo.svg")
        });
      });
      return links;
    }
  },
  data() {
    return {
      pendientes: new window.ApiArray(
        "/api/diagrams?sort=-id&per_page=200"
      ).loadFromAPI()
    };
  }
};
</script>
