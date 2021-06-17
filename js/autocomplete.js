var ref = Vue.ref;
var reactive = Vue.reactive;
var computed = Vue.computed;
var onMounted = Vue.onMounted;

app.component('Autocomplete', {    
    props: {
        items: Array,
        maxitems: Number,
        selected: String,
        placeholder: String,
        itemKey: String,
        maxlength: [Number, String],
        form: Object,
        inputtype: String,
        inputclass: String,
        id: String
    },
    setup(props, {emit}) {
        const activeItemIndex = ref(-1);
        const view = reactive({
            suggestList: false
        });
        // refs
        const autocompleteList = ref(null);
        const activeItem = ref('');        

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
            filtered = filtered.map(item => item[props.itemKey]);
            if (filtered.length > 0) {
                view.suggestList = true;
            }
            return filtered;
        });

        const selectedActiveItem = computed( () => {
            return filteredItems.value[activeItemIndex.value];
        });

        // Methods
        function nextItem() { 
            if (filteredItems.value.length < 1 || activeItemIndex.value+1 >= filteredItems.value.length) {
                return
            }           
            activeItemIndex.value ++;
            
            scrolling('down');
        }

        function prevItem() {
            if (filteredItems.value.length < 1 || activeItemIndex.value === 0) {
                return
            }     
            activeItemIndex.value --;
            scrolling('up');
        }

        function onInput() {
            activeItemIndex.value = 0;            
            emit('input');

        }

        function scrolling(direction) {
            console.log('========> AUTOCOMPLETE', autocompleteList.value.scrollTop);
            // var scrollable = scroller.scrollHeight - scroller.clientHeight;            
            // var scrollPercent = Math.ceil(scrollTop) / scrollable * 100;            
            // DEV mode only...
            console.log('=========> CURRENT ITEM condition', activeItem.value.getBoundingClientRect().top > 500)
            var oneStep = 50;            
            function notify(context) {
                console.log('----------------------------------------------');
                console.log('Container Height: ', scroller.clientHeight)
                // console.log('Max scroll (px)', scrollable)            
                console.log('Number of items: ', context.items.length)
                console.log('Y axis scroll (px): ', autocompleteList.value.scrollTop)          
                console.log('Active item index: ', context.activeItemIndex);                              
                console.log('Active item position: ', activeItem.value.top)          
                console.log('----------------------------------------------');
            }
            // Don't scroll if still visible on viewport.
            if (direction === 'up')
            {
                console.log('Scroll into view UP');
                // activeItem.value.scrollIntoViewIfNeeded({block: 'center'});
                if (activeItem.value.getBoundingClientRect().top < 103) {
                    autocompleteList.value.scrollTop -= oneStep;                    
                }
            } 
            else if (direction === 'down') 
            {
                console.log('Scroll into view DOWN');                
                // activeItem.value.scrollIntoViewIfNeeded({block: 'center'});
                if (activeItem.value.getBoundingClientRect().top > 500) {
                    autocompleteList.value.scrollTop += oneStep;
                }
            }
            // console.log(scrollPercent);
            // return scrollPercent;
        }

        function selectItem(value) {
            emit('update:selected', value);
        }

        function handleKeynav(e) {                  
            switch (e.keyCode) {
                case 40:
                    // ARROW-DOWN key pressed                    
                    nextItem();                    
                    break;
                case 38:
                    // ARROW-UP key pressed                    
                    prevItem();                    
                    break;
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
                    selectActiveItem(selectedActiveItem.value);
                    break;

            }                   
        }

        function selectActiveItem(item) {
            console.log('@debug-selectActiveItem-Item: "' + item + '" clicked')
            // Synch with model
            selectItem(item);
            // This props can be directly updated because it's an Object 
            props.form.userInput = item;
            console.log('@debug-selectActiveItem-User input value', props.form.userInput)
            // Reset completion list
            filteredItems.value.length = 0;
            view.suggestList = false;
        }

        function handleBlurAutocomplete() {
            console.log('Debug handleBlurAutocomplete: autocomplete lost focus')            
            // Synch with model
            selectItem(props.form.userInput);
            // // Reset completion list
            filteredItems.value.length = 0;
            setTimeout(() => view.suggestList = false, 200);
        }

        return {activeItemIndex, activeItem, autocompleteList, filteredItems, view, 
            onInput, handleBlurAutocomplete, handleKeynav, selectActiveItem
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
<ul 
    class="autocomplete-list list-group" 
    ref="autocompleteList" 
    v-show="view.suggestList"
>
    <li
        v-for="(item,index) in filteredItems"        
        :ref="(el) => {if (filteredItems[activeItemIndex] === item) {activeItem = el}}"
        class="autocomplete-list__item list-group-item"        
        :class="[filteredItems[activeItemIndex] === item ? 'item--active' : '']"        
        @click="selectActiveItem(item)"        
    >{{ item }}</li>
</ul>
</div>`
});