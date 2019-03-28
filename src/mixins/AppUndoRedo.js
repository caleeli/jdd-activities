const Vue = window.Vue;
const Vuex = window.Vuex;
import VuexUndoRedo from 'vuex-undo-redo';
const _ = require('lodash');

//Vue.use(Vuex);

function reference(base, element, path, passed) {
    path = path === undefined ? [] : path;
    passed = passed === undefined ? [] : passed;
    if (passed.indexOf(base) > -1) {
        return;
    } else {
        passed.push(base);
    }
    if (base === element) {
        return path.join('.');
    } else if (base instanceof Array) {
        for (let index = 0, l = base.length; index < l; index++) {
            let p = path.slice();
            p.push(index);
            let ref = reference(base[index], element, p);
            if (ref) {
                return ref;
            }
        }
    } else if (base instanceof Object) {
        const keys = Object.keys(base);
        for (let key of keys) {
            let p = path.slice();
            p.push(key);
            let ref = reference(base[key], element, p);
            if (ref) {
                return ref;
            }
        }
    }
}

let jsonProcess = JSON.stringify({
    $: {
        title: "Form title",
        post: "http://subcep.com"
    },
    JddContainer: []
});

let store = new Vuex.Store({
    state: {
        form: JSON.parse(jsonProcess),
    },
    mutations: {
        emptyState() {
            this.replaceState({
                form: JSON.parse(jsonProcess),
            });
        },
        change(state, { ref, key, value }) {
            const target = _.get(state.form, ref);
            value = JSON.parse(JSON.stringify(value));
            Vue.set(target, key, value);
        },
        add(state, { ref, place, child }) {
            const target = ref ? _.get(state.form, ref) : state.form;
            child = JSON.parse(JSON.stringify(child));
            target[place].push(child);
        },
        remove(state, { ref }) {
            if (!ref) {
                return;
            }
            const aref = ref.split('.');
            aref.pop();
            const key = aref.pop();
            const parent = _.get(state.form, aref.join('.'));
            if (parent instanceof Array) {
                parent.splice(key, 1);
            } else {
                delete parent[key];
            }
        },
        moveup(state, { ref }) {
            if (!ref) {
                return;
            }
            const aref = ref.split('.');
            aref.pop();
            const key = aref.pop();
            const parent = _.get(state.form, aref.join('.'));
            if (parent instanceof Array) {
                const u = parent.splice(key, 1);
                parent.splice(key - 1, 0, u[0]);
            }
        },
        movedown(state, { ref }) {
            if (!ref) {
                return;
            }
            const aref = ref.split('.');
            aref.pop();
            const key = aref.pop();
            const parent = _.get(state.form, aref.join('.'));
            if (parent instanceof Array) {
                const u = parent.splice(key, 1);
                parent.splice(key + 1, 0, u[0]);
            }
        },
    },
    actions: {
        loadContent(context, content) {
            jsonProcess = JSON.stringify(content);
        },
        /**
         * Move a point during the drag operation.
         * 
         */
        change({ commit }, { target, key, value }) {
            const ref = reference(this.state.form, target);
            value = JSON.parse(JSON.stringify(value));
            commit('change', { ref, key, value });
        },
        /**
         * Drop a point to its final position.
         * 
         */
        add({ commit }, { target, place, child }) {
            const ref = reference(this.state.form, target);
            child = JSON.parse(JSON.stringify(child));
            commit('add', { ref, place, child });
        },
        /**
         * Remove.
         * 
         */
        remove({ commit }, { target }) {
            const ref = reference(this.state.form, target);
            commit('remove', { ref });
        },
        /**
         * Move up.
         * 
         */
        moveup({ commit }, { target }) {
            const ref = reference(this.state.form, target);
            commit('moveup', { ref });
        },
        /**
         * Move down.
         * 
         */
        movedown({ commit }, { target }) {
            const ref = reference(this.state.form, target);
            commit('movedown', { ref });
        },
    },
});

Vue.use(VuexUndoRedo, { ignoreMutations: ['drag'] });

export default {
    store,
    computed: {
        form() {
            return this.$store.state.form
        },
    },
};
