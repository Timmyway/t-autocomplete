var ref = Vue.ref;
var reactive = Vue.reactive;
var computed = Vue.computed;
var onMounted = Vue.onMounted;

app.component('Combobox', {    
    props: {
        items: Array,
        maxitems: Number,
        inputvalue: String,
        selectvalue: String,
        placeholder: String,
        selectplaceholder: String,
        itemKey: String,
        searchKey: String,
        resultKey: String,
        maxlength: [Number, String],
        form: Object,
        inputtype: String,
        inputclass: String,
        id: String,
        selectid: String
    },
    setup(props, {emit}) {        
        const view = reactive({
            suggestList: false
        });
        const userSelection = ref('');
        // refs
        const autocompleteList = ref(null);

        const filteredItems = computed( () => {
            // Begin to search only after the users has typed 2 words            
            if (props.form.userInput.length < 2) {
                // console.log('User has typed less than 2 chars...');
                view.suggestList = false;
                return []
            }
            // console.log('List of items to Fiiiiiiilter', this.items);            
            let filtered = props.items.filter((item) => {
                if (typeof item === 'string') {
                    if (item.toLowerCase().indexOf(props.form.userInput.toLowerCase()) > -1) {
                        // console.log('Item is a string. There is a match...Items found...')
                        return true;
                    }
                } else {
// DEV mode only...
//                     console.log('*************************************************');
//                     console.log(`DEBUG: Search "${props.form.userInput.toLowerCase().trim()}"[${typeof props.form.userInput}] in "${item[props.itemKey].toLowerCase().trim()}"[${typeof item[props.itemKey]}]
// Result: ${String(item[props.itemKey]).toLowerCase().indexOf(String(props.form.userInput).toLowerCase())}`);
//                     console.log('*************************************************');
                    if (item[props.itemKey].toLowerCase()
                        .indexOf(props.form.userInput.toLowerCase()) > -1) {
                        // console.log('Item is object. There is a match...Items found...')
                        return true;
                    }
                }
            })
            .slice(0, props.maxitems + 1);            
            if (filtered.length > 0) {
                view.suggestList = true;
            }
            return filtered;
        });

        // Methods        

        function onInput() {            
            emit('input');

        }

        function selectItem() {
            console.log('Select item: update ==============>', props.searchKey);
            console.log('Select item: update ==============>', userSelection.value);
            setTimeout(() => {
                console.log(userSelection.value[props.searchKey]);
            }, 2000)
            emit('update:inputvalue', userSelection.value[props.searchKey]);
            emit('update:selectvalue', userSelection.value[props.resultKey]);
            // props.form.userInput = userSelection.value[props.searchKey]
        }

        function handleKeynav(e) {                  
            switch (e.keyCode) {                
                case 13:
                    // User press ENTER key
                    e.preventDefault();
                    if (filteredItems.value.length < 1) {
                        console.log('No item...')
                        if (props.form.userInput !== '') {
                            selectItem(props.form.userInput);
                        }
                        return
                    }
                    console.log('Enter key is pressed');
                    selectItem();
                    break;

            }                   
        }        

        function handleBlurAutocomplete() {
            console.log('Debug handleBlurAutocomplete: autocomplete lost focus')            
            // Synch with model
            selectItem(props.form.userInput);
            // // Reset completion list
            filteredItems.value.length = 0;
            setTimeout(() => view.suggestList = false, 200);
        }

        return {autocompleteList, filteredItems, view, userSelection, selectItem,
            onInput, handleBlurAutocomplete, handleKeynav
        }
    },    
    template : `<div 
    id="autocomplete"     
    class="autocomplete" 
    @keydown="handleKeynav"
>
<input 
    :id="id"
    ref="autocomplete"
    :type="inputtype ? inputtype : 'text'" 
    :class="[inputclass ? inputclass : 'form-control']"
    :placeholder="placeholder"    
    @input="onInput"
    @blur="handleBlurAutocomplete()"
    :maxlength="maxlength"    
    autocomplete="off"
    v-model="form.userInput"
>
<div class="form-group mt-2">
    <label class="text-2xl font-weight-bold mb-1" for="selectid">{{ selectplaceholder }}</label>
    <select :id="selectid" class="form-control" @change="selectItem" v-model="userSelection">
        <option value="">--</option>
        <option v-for="item in filteredItems" :value="item">{{ item[resultKey] }}</option>
    </select>
</div>
{{ filteredItems }}
</div>`
});