//BUDGET CONTROLLER MODULE
let budgetController = (()=>{

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
  
    let calculateTotal = (type)=>{
        let sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: (type, des, val)=>{
            let newItem, ID;

            //Create new ID
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp')
               newItem = new Expense(ID, des, val);
            else
                newItem = new Income(ID, des, val);
            
            //Adding it into our data structure
            data.allItems[type].push(newItem);

            //Returning the new element
            return newItem;
            
        },

        deleteItem: (type, id)=>{
            let ids,index;

            ids = data.allItems[type].map((current)=>{
                return current.id;
            });

            index = ids.indexOf(id);
        
            if(index !== -1)
                data.allItems[type].splice(index, 1);
        },

        calculateBudget: ()=>{

            //Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            //Calculate budget
            data.budget = data.totals['inc'] - data.totals['exp'];
            
            //Calculate the percentage of income that we spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;
        },

        calculatePercentages: ()=>{
            
            data.allItems.exp.forEach((curr)=>{
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: ()=>{

            let allPerc = data.allItems.exp.map((cur)=>{
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: ()=>{
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: ()=>{
            console.log(data);
        }
    };

})();

//UI CONTROLLER MODULE 
let UIController = (()=>{

    let DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    let formatNumber = (num, type)=>{
        let numSplit,int,dec,lastThree,otherNumbers,res;
        /*
            + or - before number
            exactly 2 decimal points
            comma seperating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        //Adding commas in Indian Style
        int = numSplit[0];
        lastThree = int.substring(int.length-3);
        otherNumbers = int.substring(0,int.length-3);
        if(otherNumbers != '')
            lastThree = ',' + lastThree;

        res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

        dec = numSplit[1];

        return (type == 'exp' ? '-' : '+') + ' ' + res + '.' + dec;
    };


    let objectForEach = (object, callback)=>{
        for(let i = 0; i < object.length; i++){
            callback(object[i], i);
        }
    };

        return {
            getInput: ()=>{
                return {
                    type: $(DOMStrings.inputType).val(),
                    description: $(DOMStrings.inputDescription).val(),
                    value: Number($(DOMStrings.inputValue).val()) 
                };
            },

            addListItem: (obj, type)=>{

                let html, newHtml, element;

                //Create HTML sting with placeholder text
                if(type === 'inc'){
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                    element = DOMStrings.incomeContainer;
                }
                else if(type === 'exp'){
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                    element = DOMStrings.expensesContainer;
                }

                //Replace the placeholder text with some actual data    
                newHtml = html.replace("%id%", obj.id);
                newHtml = newHtml.replace("%description%", obj.description);
                newHtml = newHtml.replace("%value%", formatNumber(obj.value,type));

                //Insert the HTML into DOM
                $(element).append(newHtml);
            },

            deleteListItem: (selectorID)=>{
                $("#" + selectorID).remove();
            },
        
            clearFields: ()=>{
                let fields;

                fields = $(DOMStrings.inputDescription + "," + DOMStrings.inputValue);

                for(let i of fields){
                    i.value = "";
                }
                fields[0].focus();
            },

            displayBudget: (obj)=>{

                let type;
                obj.budget > 0 ? type = 'inc' : type = 'exp';

                $(DOMStrings.budgetLabel).text(formatNumber(obj.budget,type));
                $(DOMStrings.incomeLabel).text(formatNumber(obj.totalInc,'inc'));
                $(DOMStrings.expensesLabel).text(formatNumber(obj.totalExp,'exp'));
                if(obj.percentage > 0)
                    $(DOMStrings.percentageLabel).text(obj.percentage + "%");
                else
                    $(DOMStrings.percentageLabel).text("---");
            },

            displayPercentage: (percentages)=>{

                let fields = $(DOMStrings.expensesPercLabel);

                objectForEach(fields, (current, index)=>{
                    if(percentages[index] > 0)
                       current.textContent = percentages[index] + "%";
                    else 
                        current.textContent = "---";
                });
            },

            displayMonth: ()=>{
                let now, month,months,year;

                now = new Date();

                months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                month = now.getMonth();

                year = now.getFullYear();
                $(DOMStrings.dateLabel).text(months[month] + ' ' + year);
            },

            changedType: ()=>{

                let fields = $(
                    DOMStrings.inputType + ',' +
                    DOMStrings.inputDescription + ',' +
                    DOMStrings.inputValue);

                objectForEach(fields, (cur)=>{
                    cur.classList.toggle('red-focus');
                });

                $(DOMStrings.inputBtn).toggleClass('red');
            },

            getDOMStrings: ()=>{
                return DOMStrings;
            }
        };
})();

//GLOBAL APP CONTROLLER MODULE
let controller = ((budgetCtrl, UICtrl)=> {

    let setupEventListeners = ()=>{

        let DOM = UICtrl.getDOMStrings();

        $(DOM.inputBtn).on("click",()=>{
            ctrlAddItem();
        });
        
        $(document).on("keypress",(event)=>{
            if(event.keyCode === 13 || event.which === 13)
                ctrlAddItem();
        });
        
        $(DOM.container).on("click",(event)=>{
            ctrlDeleteItem(event);
        });

        $(DOM.inputType).on("change", ()=>{
            UICtrl.changedType()
        });
    };

    let updateBudget = ()=>{

        //Calculate the budget
        budgetCtrl.calculateBudget();

        //Return budget
        let budget = budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = ()=>{

        //Calculate the percentages
        budgetCtrl.calculatePercentages();

        //Read the percentages from the budget controller
        let percentages = budgetCtrl.getPercentage();

        //Update the UI with the new percentages
        UICtrl.displayPercentage(percentages);
    };

    let ctrlAddItem = ()=>{
        
        let input, newItem;

        //Get the field input data
        input = UICtrl.getInput();
         
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear input fields
            UICtrl.clearFields();

            //Calculate and update budget
            updateBudget();

            //Calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = (event)=>{
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){

            splitID = itemID.split("-");
            type = splitID[0];
            ID = Number(splitID[1]);

            //Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //Update and show the new budget
            updateBudget();

            //Calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init: ()=>{
            console.log("Application started successfully");
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }
})(budgetController,UIController);

controller.init();
