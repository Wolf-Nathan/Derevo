new Vue({
    el: '#arbre',
    components: {
        'personne': {
            props: ["nom", "prenom", "id_p"],
            template: '<a v-bind:href="\'#\' + id_p">' +
                '{{nom}}' +
                '<br/>{{prenom}}' +
                '</a>'
        }
    }
});