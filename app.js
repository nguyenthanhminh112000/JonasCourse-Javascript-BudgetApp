
// DATA CONTROLLER
var budgetController = (function(){
   
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }


    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }

    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
    var calculateBudgetPercentage=function(){
        data.budget=data.totals.inc-data.totals.exp;
        if(data.totals.inc>0){
            data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
        }else{
            data.percentage=-1;
        }
    }

    return {
        addItem:function(type,description,value){
            var newItem,ID;


            // create new ID
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID=0;
            }
            //create new item based on type
            if(type==='exp'){
                newItem=new Expense(ID,description,value);
            }else{
                newItem=new Income(ID,description,value);
            }

            // push item to data structure
            data.allItems[type].push(newItem);
            // return item
            return newItem;
        },
        deleteItem:function(type,id){
            // take the the index of deletion item
            var ids,index,deletedData;
            ids=data.allItems[type].map(function(current){
                return current.id;
            })
            index=ids.indexOf(id);
            if(index!==-1){
                deletedData=data.allItems[type].splice(index,1);
            }
            return deletedData;
        },
        calculateBudget:function(type,value,control){
            if(control==='add'){
                data.totals[type]+=value;
            }else if(control==='del'){
                data.totals[type]-=value;
            }
            calculateBudgetPercentage();
            return {
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                budget:data.budget,
                percentage:data.percentage
            }
        },
        calculatePercentages:function(){
            if(data.totals.inc>0){
                data.allItems['exp'].forEach(function(current){
                    current.percentage=Math.round((current.value/data.totals.inc)*100);
                });
            }else{
                data.allItems['exp'].forEach(function(current){
                    current.percentage=-1;
                });
            }
        },
        getPercentages:function(){
            var percentages=data.allItems.exp.map(function(current){
                return current.percentage;
            });
            return percentages;
        }
    }
})();


// UI CONTROLLER
var UIController=(function(){
    
    var DOMstring={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn', // why put it here.
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetValue:'.budget__value',
        budgetIncomeValue:'.budget__income--value',
        budgetExpensesValue:'.budget__expenses--value',
        budgetExpensesPercentage:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentages:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    
    var formatNumber=function(number,type){
        var addComma=function(number){
            var comma;
            comma=((number.length)/3);
            if(Number.isInteger(comma)){
                comma-=1;
            }
            comma=Math.floor(comma);
            var times=1;
            for(var i=number.length-1;comma>0;i--){
                if(times%3===0){
                    number=number.substr(0,i)+','+number.substr(i);
                    comma--;
                }
                times++;
            }
            return number;
        }
        var intNumber,decNumber,splitNumber;
        number=Math.abs(number);
        number=number.toFixed(2);
        splitNumber=number.split('.');
        intNumber=splitNumber[0];
        decNumber=splitNumber[1];
        intNumber=addComma(intNumber);
        return (type==='inc'?'+':'-')+' '+intNumber+'.'+decNumber;
    }
    return {
        getInput:function(){
            return {
                type:document.querySelector(DOMstring.inputType).value,
                description:document.querySelector(DOMstring.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },
        getDOMstring:function(){
            return DOMstring;
        },
        addListItem:function(obj,type){
            var html,newHtml,element;
            // create HTML string with placeholder text
            if(type==='inc'){
                element=DOMstring.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==='exp'){
                element=DOMstring.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // add actual data 
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem:function(itemID){
            document.getElementById(itemID).remove();
        }
        ,
        clearFields:function(){
            var fields;
            fields=document.querySelectorAll(DOMstring.inputDescription+','+DOMstring.inputValue);
            // Is it different between list and array
            fields.forEach(function(current){
                current.value='';
            });
            fields[0].focus();
        },
        displayBudget:function(obj){
            var type=(obj.totalInc-obj.totalExp>=0?'inc':'exp');
            document.querySelector(DOMstring.budgetValue).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstring.budgetIncomeValue).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstring.budgetExpensesValue).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0){
                document.querySelector(DOMstring.budgetExpensesPercentage).textContent=obj.percentage+'%';
            }     
            else{
                document.querySelector(DOMstring.budgetExpensesPercentage).textContent='---';
            }
        },
        displayPercentages:function(percentages){
            var fields=document.querySelectorAll(DOMstring.expensesPercentages);
            // fields.forEach(function(current,index){
            //     if(percentages[index]>0){
            //         current.textContent=percentages[index]+'%';
            //     }
            //     else{
            //         current.textContent='---';
            //     }
            // });

            var listForEach=function(list,callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
            }

            listForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+'%';
                }
                else{
                    current.textContent='---';
                }
            });
        },
        displayDate:function(){
            var now,year,month,months;
            now=new Date();
            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();
            year=now.getFullYear();
            document.querySelector(DOMstring.dateLabel).textContent=months[month]+'-'+year;

        },
        changedType:function(){
            var fields=document.querySelectorAll(
                DOMstring.inputType+','
                +DOMstring.inputDescription+','+
                DOMstring.inputValue
            );
            fields.forEach(function(current){
                current.classList.toggle('red-focus');
            })
            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
        }
    };
})();

// GLOBAL APP CONTROLLER
var appController=(function(budgetCtrl,UICtrl){
    var setupEventListener=function(){
        var DOM=UICtrl.getDOMstring();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
           if(event.keyCode===13 || event.which===13){
                ctrlAddItem();
           }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }       
    var ctrlAddItem=function(event){
        var input,newItem;
        // 1 Get input data
        input=UICtrl.getInput();
        /**** Check Data ****/
        if(input.description&&input.value>0){
            //2 add item to the budget controller
            newItem=budgetController.addItem(input.type,input.description,input.value);
            //3 add new items to UI
            UICtrl.addListItem(newItem,input.type);    
            //4 clear fields
            UICtrl.clearFields();
            // 3 Calculate and Update
            updateBudget(input.type,input.value,'add');
            // 4 Update Percentages
            updatePercentages();
        }
    }
    var ctrlDeleteItem=function(event){
        var itemID,splitID,type,id,deletedData;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            id=parseInt(splitID[1]);
            // 1 DELETE THE ITEM FROM DATA STRUCTURE 
            deletedData=budgetCtrl.deleteItem(type,id);
            // 2 DELETE THE ITEM FROM UI
            UICtrl.deleteListItem(itemID);
            // 3 Calculate and Update
            updateBudget(type,deletedData[0].value,'del');
            // 4 Update Percentages
            updatePercentages();
        }   
    }

    var updatePercentages=function(){
        var percentages;
        //1 calculate percentages
        budgetCtrl.calculatePercentages();
        //2 get percentages
        percentages=budgetCtrl.getPercentages();
        //3 display percentages
        UICtrl.displayPercentages(percentages);
    }

    var updateBudget=function(type,value,control){
        var budget;
        // 3 CALCULATE THE BUDGET
        budget=budgetCtrl.calculateBudget(type,value,control);
        // 4 UPDATE THE BUDGET
        UICtrl.displayBudget(budget);
    }
    return {
        init:function(){
            setupEventListener();
            UICtrl.displayBudget({
                totalInc:0,
                totalExp:0,
                budget:0,
                percentage:-1
            });
            UICtrl.displayDate();

        }
    }
})(budgetController,UIController);
appController.init();
