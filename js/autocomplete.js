Vue.component('Autocomplete',{    
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
    data() {
        return {            
            activeItemIndex: -1,
            view: {
                suggestList: false
            }            
        }
    },
    methods: {
        scrollToActiveItem(direction) {
            const el = this.$refs.activeitem[0];             
            if (el) {
                console.log(el);
                // Use el.scrollIntoView() to instantly scroll to the element
                if (direction === 'up') {
                    el.scrollIntoView({block: 'center'});
                } else if (direction === 'down') {
                    el.scrollIntoView({block: 'center'});
                }       
            }
        },
        nextItem() { 
            if (this.filteredItems.length < 1 || this.activeItemIndex+1 >= this.filteredItems.length) {
                return
            }           
            this.activeItemIndex ++;
            
            this.scrolling('autocomplete-list', 'down');
        },
        prevItem() {
            if (this.filteredItems.length < 1 || this.activeItemIndex === 0) {
                return
            }     
            this.activeItemIndex --;
            this.scrolling('autocomplete-list', 'up');
        },
        onInput() {
            this.activeItemIndex = 0;
            this.$emit('input');

        },
        scrolling(scrollerRef, direction) {
            var scroller = this.$refs[scrollerRef];            
            var scrollable = scroller.scrollHeight - scroller.clientHeight;            
            // var scrollPercent = Math.ceil(scrollTop) / scrollable * 100;            
            // DEV mode only...
            var oneStep = 50;
            const activeElement = this.$refs.activeitem[0];
            function notify(context) {
                console.log('----------------------------------------------');
                console.log('Container Height: ', scroller.clientHeight)
                console.log('Max scroll (px)', scrollable)            
                console.log('Number of items: ', context.items.length)
                console.log('Y axis scroll (px): ', scroller.scrollTop)          
                console.log('Active item index: ', context.activeItemIndex);                              
                console.log('Active item position: ', activeElement.top)          
                console.log('----------------------------------------------');
            }
            // Don't scroll if still visible on viewport.
            if (direction === 'up')
            {
                console.log('Scroll into view UP');
                activeElement.scrollIntoViewIfNeeded({block: 'center'});
                if (activeElement.getBoundingClientRect().top < 103) {
                    scroller.scrollTop -= oneStep;
                }                
            } 
            else if (direction === 'down') 
            {
                console.log('Scroll into view DOWN');
                activeElement.scrollIntoViewIfNeeded({block: 'center'});
                if (activeElement.getBoundingClientRect().top > 500) {
                    scroller.scrollTop += oneStep;
                }                
            }            
            // console.log(scrollPercent);
            // return scrollPercent;
        },
        selectItem(value) {
            this.$emit('update:selected', value);
        },
        handleKeynav(e) {                        
            switch (e.keyCode) {
                case 40:
                    // ARROW-DOWN key pressed                    
                    this.nextItem();                    
                    break;
                case 38:
                    // ARROW-UP key pressed                    
                    this.prevItem();                    
                    break;
                case 13:
                    // User press ENTER key
                    e.preventDefault();
                    if (this.filteredItems.length < 1) {
                        console.log('No item...')
                        if (this.form.userInput !== '') {
                            this.selectItem(this.form.userInput);
                        }
                        return
                    }
                    console.log('Enter key is pressed');
                    this.selectActiveItem(this.selectedActiveItem);                    
                    break;

            }                   
        },
        selectActiveItem(item) {
            console.log('Debug selectActiveItem: Item: "' + item + '" clicked')
            // Synch with model
            this.selectItem(item);
            this.form.userInput = item;
            console.log('vvvvvvvvvv', this.form.userInput)
            // Reset completion list
            this.filteredItems.length = 0;
            this.view.suggestList = false;
        },
        handleBlurAutocomplete() {
            console.log('Debug handleBlurAutocomplete: autocomplete lost focus')            
            // Synch with model
            this.selectItem(this.form.userInput);
            // // Reset completion list
            this.filteredItems.length = 0;
            setTimeout(() => this.view.suggestList = false, 200);
        }
    },
    computed: {
        filteredItems() {
            // Begin to search only after the users has typed 2 words
            console.log('User input ====>', this.form.userInput)
            if (this.form.userInput.length < 2) {
                this.view.suggestList = false;
                return []
            }            
            // console.log('List of items to Fiiiiiiilter', this.items);            
            this.view.suggestList = true;
            let filtered = this.items.filter((item) => {
                if (typeof item === 'string') {
                    if (item.toLowerCase().indexOf(this.form.userInput.toLowerCase()) > -1) {
                        // console.log('Item is a string. There is a match...Items found...')
                        return true;
                    }
                } else {
// DEV mode only...
//                     console.log('*************************************************');
//                     console.log(`DEBUG: Search "${this.form.userInput.toLowerCase().trim()}"[${typeof this.form.userInput}] in "${item[this.itemKey].toLowerCase().trim()}"[${typeof item[this.itemKey]}]
// Result: ${String(item[this.itemKey]).toLowerCase().indexOf(String(this.form.userInput).toLowerCase())}`);
//                     console.log('*************************************************');
                    if (item[this.itemKey].toLowerCase()
                        .indexOf(this.form.userInput.toLowerCase()) > -1) {
                        // console.log('Item is object. There is a match...Items found...')
                        return true;
                    }
                }
            })
            .slice(0, this.maxitems + 1);            
            filtered = filtered.map(item => item[this.itemKey]);
            return filtered;
        },
        selectedActiveItem() {
            return this.filteredItems[this.activeItemIndex];
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
    v-model="form.userInput"
    @input="onInput"
    @blur="handleBlurAutocomplete()"
    :maxlength="maxlength"    
    autocomplete="off"
>
<ul 
    class="autocomplete-list list-group" 
    ref="autocomplete-list" 
    v-show="view.suggestList"
>
    <li
        class="autocomplete-list__item list-group-item"
        :ref="[filteredItems[activeItemIndex] === item ? 'activeitem' : '']"
        :class="[filteredItems[activeItemIndex] === item ? 'item--active' : '']"
        v-for="(item,index) in filteredItems" 
        :key="index"
        @click="selectActiveItem(item)"        
    >{{ item }}</li>
</ul>
</div>`
});