


$(document).ready(function(){


//    $(".products").each(function(i){
        

//        var url = window.location.protocol + '//' + window.location.host + this.getAttribute("url") ;  // the JSON data url
//        var xmlhttp = new XMLHttpRequest();
//        var loc = $(this); // store here, as the next function will overide the this variable

//        loc.data('i_start',0);
//        xmlhttp.onreadystatechange = function () {

//            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//                var context = JSON.parse(xmlhttp.responseText);
//                if (context.products.length>0){
//                    initProducts(context.products, loc);
//                }
//                else{
//                    loc.parents(".products").remove();
//                }
//            }
//        }
//        xmlhttp.open("GET",url,true);
//        xmlhttp.send();
//   });


    $(".products").each(function(i){
        

        var url = window.location.protocol + '//' + window.location.host + this.getAttribute("url") ;  // the JSON data url
        var loc = $(this); // store here, as the next function will overide the this variable
        $.ajax({
            url: url,
            cache: false
        })
          .done(function (context) {
 //        alert(context);
                var context = JSON.parse(context);
                if (context.products.length>0){

                // multiply data for testing purposes
                //    var i;
                //    for (i=0;i<7;i++){
                //    context.products = context.products.concat(context.products);
                //     }

                    var pd = new  ProductDisplay(loc, context.products);
//                    pd.bind();
                    var condition = new Condition(pd.objects);

                    var pg = new Paginator(condition,'pagination');
                    pd.domEl.data("pg",pg);

                    pd.jquery(pg);
                    pd.show(pg); // make the selected products visible

                }
                else{
                    loc.parents(".products").remove();
                }
            });
        });











function Selector(pd,form_class="",type="dropdown", label='Sort by',act_on="array",action="click",options=[]){

    // class should be product-sorting for sorting Dropdown

    this.pd = pd;
    this.class = form_class;  
    this.type = type;

    this.label = label;
    this.act_on = act_on;
    this.action = action;

    this.options = options;

}

Selector.prototype = {
    display: function(){

        var options_base;
        var form = $(`<form class="${this.class}" role="form"></form>`);
       

        if (this.type == "dropdown"){
            var dropdown = $('<div class="dropdown"></div>');
            options_base = $('<ul class="dropdown-menu sorter"></ul>');
 
            var header = $(`<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">${this.label}
    <span class="caret"></span></button>`);

            form.append(dropdown);
            dropdown.append(options_base);
            dropdown.append(header);
        }
        else if ( (this.type == "checkbox") ||  (this.type == "radio")  ){
            options_base = form;          
        }

        var i;
        for (i=0;i<this.options.length;i++){
            options_base.append(this.options[i]);
        }
        return form;
    },

    make_element(description,func){

        var list_el;
        var that = this;

        if (this.type == "dropdown"){
                 
            list_el = $(`<li><a href="#">${description}</a></li>`);
        }
        else if ( (this.type == "checkbox") || (this.type == "radio")  ){
            list_el = $(`<div class="${this.type}"><label><input type="${this.type}">${description}</input></label></div>`);

        }


        if (this.act_on == "array"){
//console.log(this.action);
            list_el.on(this.action,function(){
                                   // update the ProductDisplay 
                                   that.pd.do_func(func);

                                   $('.dropdown.open .dropdown-toggle').dropdown('toggle'); // close the dropdown again after selection
                                   return false;
                                  }); 
        }
        else if (this.act_on == "pd"){


        }
       
        return list_el;
    },

    add: function(description,func){
        // Add selection element with behavior from the outside after Selector creation 

        this.options.push(this.make_element(description,func));
    },
}

















function Filter(description='test', pd, condition = function (p) { return (parseInt(p.price)<70);} ){
    this.description = description;
    this.pd = pd;
    this.condition = condition;

}

Filter.prototype = {

   

    jquery: function () {
        var that = this;

        var button = $(`<a href="#"  class="btn btn-info" role="button">${this.description}  </a>`);

    //    var button =$(`<a class="btn btn-primary" href="#" role="button">Link</a>`);

        var delete_button = $(`<span class="glyphicon glyphicon-remove" style="vertical-align:middle"></span>`);
        button.append(delete_button);
        this.dom = button;

        button.on("click",function (){return false;});
        delete_button.on("click",function (){that.remove();that.pd.refresh();return false;});

        return button;
    },

    remove : function () {

        var i;
     
        i = this.pd.filters.map(function(x) {return x.description; }).indexOf(this.description);

        if (i>-1){
          
            this.pd.filters.splice(i,1);
        }
        else{
            console.log('Warning: could not find filter in queue');
        }

        this.dom.remove();

    },
}


function Condition(objects,cycle=false){
   
    this.cycle = cycle;

    this.current_cat = 0;       
}


Condition.prototype = {

    // the condition should be light on resources, as it is called on every product.

    condition: function (index , objects, showlen =3) { 

                   if (index==-1) return Math.ceil(objects.length/showlen );  // pages length reporting for -1 argument
                   return (index >= this.current_cat*showlen ) && (index < (this.current_cat+1)*showlen);  

               },

    reset : function () {this.current_cat = 0},

    next: function (objects) {
        if (this.cycle){
            this.current_cat = (this.current_cat + 1)%this.condition(-1,objects);              
        }
        else{
            if (this.current_cat < this.condition(-1,objects)-1){
                this.current_cat = this.current_cat + 1;     
            }
        }
    },

    previous: function (objects) {
 
        if (this.cycle){
           this.current_cat = this.current_cat - 1; 
           if (this.current_cat < 0) {this.current_cat = this.current_cat + this.condition(-1,objects)};      
        }
        else{
           if (this.current_cat>0){
               this.current_cat = this.current_cat - 1;
           }
        }
    },

    set:  function (current_cat, objects) {
        if (current_cat> this.condition(-1,objects)){
            current_cat = this.condition(-1,objects);
        }
        else if (current_cat < 0){
            current_cat = 0;
        }
        this.current_cat = current_cat;
    },

    get: function (){
        return this.current_cat;
//        return this.indices[this.current_cat];
    },

    at_start: function(){return this.get() == 0;},
    at_end: function(objects){return this.get() == this.condition(-1,objects)-1;},

    left_denied: function() {return this.at_start() && !this.cylce },
    right_denied: function(objects) {return this.at_end(objects) && !this.cylce },

    display_cat: function (i) { return (i+1).toString()+' ';  },

    check_current : function (objects) {
        if (this.current_cat > objects.length-1) {
            this.current_cat = objects.length-1;
        }

    },

}


// use the following for alphabetical indexing

//Condition.prototype.condition = function (index, objects) {
//                                   if (index == -1) return 26;
//                                   if (index < 26) {
//                                       return objects[index].p.title.startsWith(String.fromCharCode(this.get()+65))
//                                  };
//                                };

//Condition.prototype.display_cat =  function (i) { return String.fromCharCode(i+65) + ' ';  };


// this is how you can add things. But the Paginator object overrides them if they co-incide
// Therefore, view the prototype as having the next etc functions, and the actual function as the more specific


function Paginator(condition, type='list-inline', neighbors=1){
    // keeps track of current position in pagination

    // possible functions: could provide html represenation of pages: 1, 2, ... , 24 with current page highlighted
 
    this.type = type;
    this.condition = condition;
    this.neighbors = neighbors;
  
}



Paginator.prototype = {

    new_list_element: function (cls = "") {

        if (this.type =="list-group"){ 
            tag ="a"; cls = cls + " list-group-item"
        }
        else{
            tag ="li"; 
        }

        var li = $(`<${tag} href="#" class="${cls}"></${tag}>`);

        return li;
    },

    new_page_element: function (i) {
        var li_html;

        var li = this.new_list_element();
        li.addClass("clickable");
   
        if (i == ' ... '){
            li_html = ' ... ';
            li.data("i",-1); // signal that this is not a link
        }
        else{
            li.data("i",i);
            li_html = this.condition.display_cat(i);

            if (i == this.condition.current_cat){

                if ( (this.type == "list-group")  || (this.type =="pagination") ){
                    li.addClass("active");
                }
                else if(this.type == "list-inline"){
                    li.addClass("badge active");
                }
            }
        }

        var a = $('<a href="#"></a>');
        li.append(a);

        a.html(li_html);

        return li;
    },

    jquery: function (objects,cls=""){
        // create a paginator in the DOM        

        var i;
        
        if (this.type =="list-group"){ 
            tag ="ul"; 
        }
        else{
            tag ="div"; 
        }

        var ul = $(`<${tag} class="${cls}"></${tag}>`);

        ul.addClass(this.type);
        ul.addClass("pag-ul");

        var i_low = Math.max(0,this.condition.current_cat - this.neighbors);
        var i_high = Math.min(this.condition.condition(-1,objects),this.condition.current_cat + this.neighbors+1);

        for (i=i_low;i<i_high;i++){

            ul.append(this.new_page_element(i));
        }

        if (i_low==1){
            ul.prepend(this.new_page_element(0));
        }
        else if (i_low>1){
            ul.prepend(this.new_page_element(' ... '));
            ul.prepend(this.new_page_element(0));
        }        

        if (i_high==this.condition.condition(-1,objects)-1){
            ul.append(this.new_page_element(this.condition.condition(-1,objects)-1));
        } 
        else if (i_high<this.condition.condition(-1,objects)-1){
            ul.append(this.new_page_element(' ... '));
            ul.append(this.new_page_element(this.condition.condition(-1,objects)-1));
        }        

        return ul;
    },
}




ProductHolder.prototype = {

    jquery : function (show=false) {
        var product_div = $(`<div class="col-sm-4 col-lg-4 col-md-4 product"></div>`)

        if (!show){
            product_div.hide();
        }

        var thumbnail = $(`<div class="thumbnail"></div>`);

        var image_span = $(`<span class="image"><a href=""></a></span>`);

        var image = $(`<img src="//:0"    alt="Link to Product">`);
 
        image_span.children("a").append(image);

//    console.log(image.attr('src'));
        var caption = $(`<div class="caption"></span>`);
        var ratings = $(`<div class="ratings"><span class="rating"></span></div>`);

        var price = $(`<span class="price"> </span>`);
        var title = $(`<span class="title"></span>`);
        var description = $(`<span class="description"></span>`);

        caption.append(price);
        caption.append(title);
        caption.append(description);

        thumbnail.append(image_span);
        thumbnail.append(caption);
        thumbnail.append(ratings);

        product_div.append(thumbnail);    
  
        return {product: product_div,image_span:image_span,image:image, thumbnail: thumbnail, caption: caption, ratings: ratings,price:price,title:title,description:description};
    },


    bind : function(p){
        // bind product details from product array element p (obtained earlier from JSON) to this placeholder object
        // and update the DOM!

        this.p = p;

        this.dom.image_span.children("a").attr("href" ,p.url);

        if (this.dom.product.is(":visible")){
            this.dom.image.attr("src",p.image);
        }
        else{
            this.dom.image.attr("src","//:0");
        }

        
        this.dom.price.html('$'+p.price);
        this.dom.title.html(p.title);
        this.dom.description.html(p.description);
    },

    extract : function () {
                  return this.p;
              },

    remove_node : function() {this.dom.product.remove()},


    show : function (){
      
            this.dom.product.show();
            this.dom.image.attr("src", this.p.image);
    },


    hide : function(){
            this.dom.product.hide();
            this.dom.image.attr("src", "//:");
    },

}

function ProductHolder(domEl){

    // bind any array of p to an existing array of productHolder

    // Create and attach object containing pointers to DOM to dom attribute
    this.dom = this.jquery();

    // Attach pointer to parent dom element (usually the div containing the products) to domEl property
    this.dom['domEl'] = domEl;

    this.cursor = -1;

}




ProductDisplay.prototype = {

    reset : function (init=-1) {
        this.cursor = init;
    },


    update_cursor : function () {
        this.cursor++;

        if (this.cursor >= this.objects.length){
            return -1
        }
        else{
            return this.cursor;
        }
    },

    add_product : function (p) {
        var i = this.update_cursor(); 
        if (i>-1){
            this.objects[i].bind(p);
        }
        else{
            var ph = new ProductHolder(this.div);
            this.objects.push(ph);
            ph.bind(p);               
        }
    },

    prune : function () {
        var i;
        var oblen = this.objects.length; // store this, as we are working on this.objects

//        console.log(`objects len: ${this.objects.length} cursor: ${this.cursor} i: ${i}`);

        if (this.objects.length-1>this.cursor){
            for (i=this.cursor+1;i<oblen;i++) {
                var p = this.objects.pop();

                p.remove_node();
            }
        }      
    },

    bind : function(arr){
        // Bind array of product elements arr (obtained earlier from JSON) to array of productHolder elements
        // Grows and shrinks objects array according to length of arr argument
      
        var ph;
        var i;
//        var j=0;
        var flag=true;
        var that =this;

        this.reset();

        // go through arr, apply the filter conditions for each p in arr, and bind to product placeholders if met 
        for (i=0;i<arr.length;i++){
            flag = true;
            this.filters.forEach(function(filter){flag = flag && filter.condition(arr[i])});
   
            if (flag){
                this.add_product(arr[i]);
       //         j++;
            }
        } 
//        alert(`b4 prune: objects len=${this.objects.length} cursor=${this.cursor}`);

        this.prune();

//        alert(`after prune: objects len=${this.objects.length} cursor=${this.cursor}`);

    },

    extract : function () {
                  var result = [];
                
                  this.objects.forEach(function (ob) {
                      result.push(ob.extract());
                  });
                  return result;
              },

    add_filter : function (description, condition = function (p) { return (parseInt(p.price)<70);}){
                     var filter = new Filter(description,this,condition);

                     return this.filters.push(filter); 
                  },


    show : function(pg){
       // examples for condition: 
       // example for condition: function (i,objects) {return true;} 
       // example for condition: function (i,objects) {return i>4;} 
       // function (i,objects) {return objects[i].p.title.startsWith('S');}

        var i;
  
        for (i=0;i<this.objects.length;i++){
            if (pg.condition.condition(i, this.objects)) {
                this.objects[i].show();
            }
            else{ 
                this.objects[i].hide();
            }
        } 
    },





    jquery : function (pg) {
        // DOM display method for ProductDisplay
 
        var i;
        var row_paginator = $('<div class="row paginator"></div>');
        var row_sorter = $('<div class="row sorter"></div>'); // for the sorter, filters and possibly messages
        var ul;
        var list_el;

        var encapsulation;
        var that = this;
        var col;

//console.log(this.div.find(".paginator:first").attr("class"));

        if ( this.div.find(".paginator").length>0  ){
            this.div.find(".paginator").remove();
        }

        this.div.append(row_paginator);

       
        if ( this.div.find(".sorter").length>0  ){
            this.div.find(".sorter").remove();
        }

        if ( ('sorter' in this.layout) && (this.layout['sorter'] != 'none') ){
            
            if (this.layout['sorter'] == 'top'){ 
                this.div.prepend(row_sorter);
            }
            else if (this.layout['sorter'] == 'bottom'){ 
                this.div.append(row_sorter);
            }
            else if (this.layout['sorter'] != 'none'){ 
                $(this.layout['sorter']).append(row_sorter);
            }
        }

        


        // Append objects to DOM 

        this.objects.forEach( function (obj) {
            that.domEl.append(obj.dom.product);
        });


        if (pg.condition.condition(-1,this.objects)>1){ // only display paginator for more than 1 page

            if ( ('paginate' in this.layout) && (this.layout['paginate'] !='none')   ){             
                col = $(`<div class="col-sm-10 col-lg-10 col-md-10 button-col "></div>`);

                var div = $('<div class="paginate"></div>');
                var paginate = pg.jquery(that.objects); // create paginator DOM object

                this.update_clicks(paginate);
  
                div.html( paginate);
                col.append(div);

                this.paginate_dom = col;

                if (this.layout['paginate'].loc == 'bottom'){
                    row_paginator.append(col);
                }
                else if (this.layout['paginate'].loc != 'none'){
                    $(this.layout['paginate'].loc).append(col);
                }

            }

            if ('buttons' in this.layout){

                if ('loc' in this.layout['buttons']){
                    if (this.layout['buttons'].loc == 'sides'){
                        encapsulation = false;
                        this.pag_dom = this.domEl;
                    }
                    else if (this.layout['buttons'].loc == 'paginate') {
    
                        var li_left = pg.new_list_element(); // produces $('<li href="#" class="left-button-prod"></li>') by default
                        var li_right = pg.new_list_element(); 

                        encapsulation = {left: li_left, right: li_right};
                    
                        this.pag_dom = this.paginate_dom.find(".pag-ul");

                    }
                    else if (this.layout['buttons'].loc != 'none' ){
                        encapsulation = false;
                    
                        this.pag_dom = $(this.layout['buttons'].loc);

                    }

                    var buttons = this.left_right_buttons(pg, encapsulation);

                    buttons[0].addClass("left-button-prod");
                    buttons[1].addClass("right-button-prod");


                    this.pag_dom.prepend(buttons[0]);
                    this.pag_dom.append(buttons[1]);

                    if ( pg.condition.left_denied()  ) {

                        this.pag_dom.find(".left-button-prod").hide();
                    }
                    else{
                        this.pag_dom.find(".left-button-prod").show();
                    }

                    if ( pg.condition.right_denied(that.objects)  ) {
                        this.pag_dom.find(".right-button-prod").hide();
                    }
                    else{
                        this.pag_dom.find(".right-button-prod").show();
                    }



                    if ('type' in this.layout['buttons']){

                        if (this.layout['buttons'].type == 'arrow'){
 
                            buttons[0].addClass("glyphicon glyphicon-menu-left btn left-button pull-left");
                            buttons[1].addClass("glyphicon glyphicon-menu-right btn right-button pull-left");

                        }
                        else if (this.layout['buttons'].type == 'text'){

                            buttons[0].find("a").text("Prev");
                            buttons[1].find("a").text("Next");
                        }
                    }
                    else{
 
                    }
                }
            }
        }


        if ( ('sorter' in this.layout) && (this.layout['sorter'] != 'none') ){
//            var dropdown = new Selector(this,form_class="product-sorting",type="checkbox", label='Sort by',act_on="array",action="change");

            var dropdown = new Selector(this,form_class="product-sorting",type="dropdown", label='Sort by',act_on="array");

            dropdown.add('Recent', function (arr) { arr.sort(function (p,q) {if (p.created < q.created) return -1;
                                                        if (p.created > q.created) return 1;
                                                        return 0;
                                                    });
                                                  });

            dropdown.add('A-Z', function (arr) { arr.sort(function (p,q) {if (p.title < q.title) return -1;
                                                     if (p.title > q.title) return 1;
                                                     return 0;
                                                    });
                                                  });

            dropdown.add('Price', function (arr) { arr.sort(function (p,q) {return p.price - q.price;
                                                    });
                                                  });

            dropdown.add('Popularity', function (arr) { arr.sort(function (p,q) {return q.soldproduct__sold - p.soldproduct__sold;
                                                    });
                                                  });

  
//                col = $(`<div class="col-sm-2 col-lg-2 col-md-2 button-col "></div>`);
                ul = $(`<ul class="list-inline sort-list"></ul>`);
                list_el = $('<li></li>');
                ul.append(list_el);
               
                list_el.append(dropdown.display(that));
                row_sorter.prepend(ul);           

        }




        if ( ('filters' in this.layout) && (this.layout['filters'] != 'none') ){
//            var dropdown = new Selector(this,form_class="product-sorting",type="checkbox", label='Sort by',act_on="array",action="change");

            dropdown = new Selector(this,form_class="filters",type="dropdown", label='Price',act_on="array");
     
            dropdown.add('Price < 10', function (){that.add_filter('Price < 10', function (p) { return (parseInt(p.price)<10);} );that.refresh();} );

            dropdown.add('Price < 20', function (){that.add_filter('Price < 20', function (p) { return (parseInt(p.price)<20);} );that.refresh();} );

            dropdown.add('Price < 30', function (){that.add_filter('Price < 30', function (p) { return (parseInt(p.price)<30);} );that.refresh();} );

            dropdown.add('Price < 40', function (){that.add_filter('Price < 40', function (p) { return (parseInt(p.price)<40);} );that.refresh();} );

                row_sorter.prepend(dropdown.display(that));           

        }



        // display existing filters
        if (this.filters.length > 0){
            for (i=0;i<this.filters.length;i++){
  //              col = $(`<div class="col-sm-2 col-lg-2 col-md-2 button-col "></div>`);
                list_el = $('<li></li>');

                list_el.html(this.filters[i].jquery());
                (row_sorter.find(".sort-list")).append(list_el);
//                alert(row_sorter.find(".sort-list").first().attr("class"));

  //              row_sorter.append(col);            
            }
        };

        return this.div;
    },



    update_clicks : function (paginate) {

        var i;
        var list_els = paginate.find(".clickable");
        var pg;
        var that = this;

        // add the behaviours to the paginator clickable elements, excluding buttons
        for (i=0;i<list_els.length;i++){
  
            list_els.eq(i).click(function(){
                    if ($(this).data("i") >=0){
                        pg = that.domEl.data("pg"); // retreive the paginator from DOM data
       
                        // directly set the current category (page) corresponding to the list element clicked on
                        pg.condition.set($(this).data("i"), that.objects);

                        // update this ProductDisplay using the updated paginator pg
                        that.update(pg);

                    }
                    return false;      
                });
        }
    },


    update : function (pg) {
        // update visibility of products in this ProductDisplay
        // if present, update paginator and carry over buttons

        this.domEl.data("pg",pg);  // store paginator in DOM

        if ( ('buttons' in this.layout) && (this.layout['buttons'] != 'none') ){
    

            var left_button = this.pag_dom.find(".left-button-prod");

            var right_button = this.pag_dom.find(".right-button-prod");

            if ( pg.condition.left_denied()  ) {

                left_button.hide();
            }
            else{
                left_button.show();
            }

            if ( pg.condition.right_denied(this.objects) ) {
                right_button.hide();
            }
            else{
                right_button.show();
            }
        }


        // update paginator in DOM
        if ( ('paginate' in this.layout) && (this.layout['paginate'] != 'none' ) ){
               
            var paginate = this.paginate_dom; // retrieve paginate DOM element

            var ul = pg.jquery(this.objects);  // build the paginator list again

            var that = this;

            if (  ('buttons' in this.layout) && (this.layout['buttons'] != 'none') && (this.layout['buttons'].loc=='paginate') ){
                this.pag_dom = ul;
                // carry over the buttons inside the pagination list
                ul.prepend(left_button);  
                ul.append(right_button);

            }

            paginate.html(ul);

            this.update_clicks(paginate);  
        } 
       
        this.show(pg);  // set the visibility of this ProductDisplay according to paginator state

    },




    left_right_buttons : function (pg, encapsulation = false) {
        /* just create 2 buttons

           data should be appended to a different div
           should later be incorporated into ProductDisplay as method  */

        this.domEl.data("pg",pg);  // initialize the paginator data

        var left_button = $('<a href="#"></a>')
        var right_button = $('<a href="#"></a>')

        if (encapsulation) {
            encapsulation['left'].append(left_button);
            left_button = encapsulation['left'];

            encapsulation['right'].append(right_button);
            right_button = encapsulation['right'];
        }
        
        var that = this;  

        left_button.click(function(){
             var pg = that.domEl.data("pg");
             pg.condition.previous(that.objects);
             that.update(pg);
             return false;
        });

        right_button.click(function(){
             var pg = that.domEl.data("pg");
             pg.condition.next(that.objects);
             that.update(pg);
             return false;
        });


        return [left_button, right_button];
//        this.domEl.prepend(left_button);
//        this.domEl.append(right_button);

    },

    refresh : function () {
  //      console.log(this.all_products.length);
        this.bind(this.all_products);

        var pg = this.domEl.data("pg");

        pg.condition.reset();
        this.jquery(pg);
        this.show(pg);
    },

    do_func : function (func) {

        var arr = this.extract();
        func(arr);
        this.bind(arr);

    },
}

function ProductDisplay(domEl, arr,  layout = {'buttons':{'loc':'paginate','type':'text'}, 
                                          'paginate':{'loc':'bottom','type':'list-inline'},
                                          'sorter' : 'top', 'filters' : 'side'
                                           }) {
    /* Product placeholder object
       Contains an array of productHolder elements under attribute "objects".

       Arguments:
       domEl: master div, stored in this.div

    */

    var filter;

    var row = $('<div class="row related-products"></div>');
    domEl.append(row);

    this.div = domEl;
    this.domEl = row;
    this.objects = [];
    this.layout = layout;

    this.filters = [];
    this.add_filter('yo');

    this.all_products = arr;
    this.bind(arr);

}



});


