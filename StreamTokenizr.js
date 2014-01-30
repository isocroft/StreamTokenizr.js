/**************************************************************************
 *  Copyright © 2013 @abnlabs http://cproscodedev.com.ng                  *
 *  All Rights Reserved                                                   *
 *                                                                        *
 *  @package Library                                                      *
 *  @license MIT                                                          *
 *  @author  Ifeora Okechukwu                                             *
 *  @description A simple "character" stream tokenizer that tries to      *
 *               tokenize any group of characters from a file or string   *
 * ---------------------------------------------------------------------- *
 * File Name: StreamTokenizr.js (for HTML & CSS & XML)                   *
 * Version: 0.2                                                           *
 * Date Created: 02/12/2013                                               *
 * Date Last Modified: 01/24/2014                                         *
 *                                                                        *
 * Adapted from the Java Programming Language                             *
 * Package Name: java.io                                                  *
 * Class Name: StreamTokenizer                                            *
 *                                                                        *
 * Redistribution and use in source and binary forms, with or without     *
 * modification are permitted under open source licensing terms without   *
 * the transfer of rights                                                 *        
 *------------------------------------------------------------------------*
 * THIS LIBRARY IS PROVIDED BY THE COPYRIGHT HOLDERS AND AUTHORS ON AN    *
 * "AS IS" BASIS HENCE ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,      *
 * BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND      * 
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE *
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,    *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES               *
 *------------------------------------------------------------------------*/
 
 
var StreamTokenizr = function(Object, isFile){
     
        if(typeof(Object) != "string") return null;
        if(typeof(isFile) != "boolean") return null;
		
		// Private Fields

        var ST = {}, SKP = {}, isf = isFile;

        // Public Fields

        StreamTokenizr.prototype.ttype = null;
        StreamTokenizr.prototype.seek = 0;
        StreamTokenizr.prototype.ref = 0;
        StreamTokenizr.prototype.eis = false;
        StreamTokenizr.prototype.sis = false;  

        // Static fields 

         StreamTokenizr.HTML = 'html';        // constants for setting the current signal (very important)
         StreamTokenizr.JSON = 'json';
         StreamTokenizr.CSS = 'css';
       
         StreamTokenizr.T_TAG_OPEN = null;    // constants for HTML & XML 
         StreamTokenizr.T_TAG_CLOSE = null;
         StreamTokenizr.T_TAG$_OPEN = null;
         StreamTokenizr.T_TAG$_CLOSE = null;
         StreamTokenizr.T_ENT_CHARS = null;
         StreamTokenizr.T_ENT$_CHARS = null;
         StreamTokenizr.T_ATR_LIST = null;

         StreamTokenizr.T_JSN_OBJ = null;     // constants for JSON
         StreamTokenizr.T_JSN$_OBJ = null;
         StreamTokenizr.T_JSN_ARR = null;
         StreamTokenizr.T_JSN$_ARR = null;
         StreamTokenizr.T_JSN_BOL = null;
         StreamTokenizr.T_JSN$_BOL = null;
         StreamTokenizr.T_JSN_NUM = null;
         StreamTokenizr.T_JSN$_NUM = null;
         StreamTokenizr.T_JSN_STR = null;
         StreamTokenizr.T_JSN$_STR = null;

         StreamTokenizr.T_AT_RULE = null;      // constants for CSS
         StreamTokenizr.T_SELECTOR = null;
         StreamTokenizr.T_RULE = null;
	       StreamTokenizr.T$_RULE = null;

         StreamTokenizr.T_EOL = -1;            // general purpose constants
         StreamTokenizr.T_EOF = 0;
         StreamTokenizr.T_SPC = -2;
         StreamTokenizr.T_WORD = -3;   
         StreamTokenizr.T_NUMBER = -4;
         StreamTokenizr.T_ERROR = -5;

        // Private Methods
      
        var getFileExtension = function(file){
            var bg = file.lastIndexOf('/')+1;
            var lin = file.lastIndexOf('.');
            if(bg)
              file = file.substring(bg);
            else
              file = file;

            return (lin) ? file.substring(lin) : null;
        },

        activateKeyConsts = function(sig){
           if(isf && sig === null) 
		        throw new Error("StreamTokenizr -> file name incorrect");
           
		   switch(sig){
              case "html":
                  StreamTokenizr.T_TAG_OPEN = 1; 
                  StreamTokenizr.T_TAG_CLOSE = 2;
                  StreamTokenizr.T_TAG$_OPEN = 3;
                  StreamTokenizr.T_TAG$_CLOSE = 4;
                  StreamTokenizr.T_ENT_CHARS = 5;
                  StreamTokenizr.T_ENT$_CHARS = 6;
                  StreamTokenizr.T_ATR_VAL = 7;
                  ST.signal = (sig) ? sig.toUpperCase() : null;
              break;
              case "json":
                  StreamTokenizr.T_JSN_OBJ = 1;    // constants for JSON
                  StreamTokenizr.T_JSN$_OBJ = 2;
                  StreamTokenizr.T_JSN_ARR = 3;
                  StreamTokenizr.T_JSN$_ARR = 4;
                  StreamTokenizr.T_JSN_BOL = 5;
                  StreamTokenizr.T_JSN$_BOL = 6;
                  StreamTokenizr.T_JSN_NUM = 7;
                  StreamTokenizr.T_JSN$_NUM = 8;
                  StreamTokenizr.T_JSN_STR = 9;
                  StreamTokenizr.T_JSN$_STR = 10; 
                  ST.signal = (sig) ? sig.toUpperCase() : null;
              break;
              case "css":
			      StreamTokenizr.T_AT_RULE = 1;     
                  StreamTokenizr.T_CSS_SEL = 2;
                  StreamTokenizr.T_RULE = 3;
				  StreamTokenizr.T$_RULE = 4;      
                  ST.signal = (sig) ? sig.toUpperCase() : null;
              break;
              default: 
           }
        }, 

        getXHRResponse = function(url){
            var req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			try{
			   req.onreadystatechange = function(){
			      if((req.status == 200 || req.staus == 304) && req.reayState == 4){

				       return ({"rtype":req.getResponseHeader('Content-Type'),"resp":req.responseText});
				    }
			   }
		       req.onprogress = function(e){
			       if(e.lengthComputable){
				         console.log("Progress: "+e.total/e.length+"%");
				     }
			    }

         url = url+(new Date).getTime();

			   req.setRequestHeader('X-Requested-With','XMLHttpRequest');
			   req.open("GET", url, true);
			   req.send(null);
			}catch(e){ 
			   return null;
			}
        },

        getNext = function(){  
           if(StreamTokenizr.prototype.ttype === null){
                  StreamTokenizr.prototype.ttype = ST.stobject.charAt(ST.index);
           }else{
                  ++ST.index;
                  StreamTokenizr.prototype.ttype = ST.stobject.charAt(ST.index);
           }
        },

         getType = function(t){
            var f = ST.stobject.charAt(ST.index - 1);
			// TODO: rf = StreamTokenizr.prototype.ref;
            switch(ST.signal){             
                      case "HTML":
                        switch(t){
                           case '<':
                             return 1;
                           case '>':
                             return (f != '<' && StreamTokenizr.prototype.ref == 1) ? 2 : (f != '<' && StreamTokenizr.prototype.ref != 1) ? 4 : -5 ;
                           case '/':
                             return (f == '<' && StreamTokenizr.prototype.ref == 1) ? 3 : (f != '<' && StreamTokenizr.prototype.ref != 1) ? -3  : 4;
                           case '"':
                             return (f == '=' && StreamTokenizr.prototype.ref == 1) ? 7 : -3;
                           case '&':
                             return (StreamTokenizr.prototype.ref == 1) ? -5 : 5 ;
                           case ';':
                             return (StreamTokenizr.prototype.ref == 5) ? 6 :  -3;
                           case ' ':
                             return -2;
                           case '\n':
                           case '\r':
                             return (SKP.n) ? -3 : -1;
                           case '0':
                           case '1':
                           case '2':
                           case '3':
                           case '4':
                           case '5':
                           case '6':
                           case '7':
                           case '8':
                           case '9':
                             return -4;
                           case '':
                             return 0;
                           default:
                             return -3;  
                        }
                      break;

                      case "JSON":
                        switch(t){
                           case '{':
                               return (StreamTokenizr.prototype.ref == 2 || StreamTokenizr.prototype.ref == 1) ? 1 : 1;
                           break;
                           case '}':
                               return (StreamTokenizr.prototype.ref == 1) ? 2 : (StreamTokenizr.prototype.ref == 2 ? -5 : 2);
                           case '[':
                               return (StreamTokenizr.prototype.ref == 4 || StreamTokenizr.prototype.ref == 3) ? 3 : 3;
                           case ']':
                               return (StreamTokenizr.prototype.ref == 3) ? 4 : (StreamTokenizr.prototype.ref == 4) ? -5 : 4;
                           case '"':
                               return (StreamTokenizr.prototype.ref == 9 && f != '\\') ? 10 : (StreamTokenizr.prototype.ref == 10 && f != '\\') ? 9 : -3 ;
                           case 't':
                           case 'f':
                              return (StreamTokenizr.prototype.ref != 9 || StreamTokenizr.prototype.ref != 10) ? 5 : -3;
                           case 'e':
                              return (StreamTokenizr.prototype.ref != 9 || StreamTokenizr.prototype.ref != 10) ? 6 : -3;
                           case ' ':
                              return -2;
                           case '\n':
                           case '\r':
                             return (SKP.n) ? -3 : -1; 
                           case '0':
                           case '1':
                           case '2':
                           case '3':
                           case '4':
                           case '5':
                           case '6':
                           case '7':
                           case '8':
                           case '9':
                              return -4;
                           default:
                              return -3;
                           break;
                        }
                      break;
                      default:
                        return null;
           }
        }

        var obj = getXHRRespose(Object);

        var init = function(){
             ST.signal = null;
             ST.buffer = "";
             ST.index = 0;
             ST.stobject = (isf && obj.rtype) ? obj.resp : Object;
             ST.ext = (isf) ? getFileExtension(Object) : null; 
             SKP.n = false;
             SKP.s = false;
             activateKeyConsts(ST.ext);
        } 

        // Public Methods 

        StreamTokenizr.prototype.nextToken = function(){
             if(ST.signal === null) throw new Error("StreamTokenizr -> cannot get current token from streamed input");
              getNext();       
              this.seek = getType(this.ttype);
              if(this.seek >= 1 || this.seek <= 10){
                      this.ref = this.seek; 
              }  
                   return this.seek;     
        }    
 
        StreamTokenizr.prototype.getCurrentIndex = function(){
                   return ST.index;
        }

        StreamTokenizr.prototype.setCurrentIndex = function(inx){
                   ST.index = (inx < 0)? 0 : inx;
        }

        StreamTokenizr.prototype.eolIsSignificant = function(cond){
                   this.eis = cond;
        }

        StreamTokenizr.prototype.setSignal = function(sig){
               switch(sig){
                   case 'html': // fall through
                   case 'json':
                   case 'css':
                     ST.ext = sig;
				   break;	 
                   default:
                     ST.ext = null;
                   break;
               } 
               activateKeyConsts(ST.ext);
        }

        StreamTokenizr.prototype.fillBuffer = function(bval, bfunc){
              ST.buffer += bval;
              bfunc = bfunc || null;
              return (bfunc !== null) ? bfunc.call(null, ST.buffer) : true;
        }

        StreamTokenizr.prototype.flushBuffer = function(){
		      var buf = ST.buffer;
              ST.buffer = ""; // clear it!
			  return buf;
        }

        StreamTokenizr.prototype.qualifyBuffer = function(val){
              return (ST.buffer === val);
        }

        StreamTokenizr.prototype.setSkip = function(skp){
            for(var g=0; g < skp.length; g++){
                switch(skp[g]){
                   case 'n':
                    if(this.eis){
                       if(SKP.n) 
                          throw new Error("StreamTokenizr -> cannot authorize skip on a line feed char");
                        else
                          return;
                    }else{
                         if(SKP.n)
                             return;
                         else
                            SKP.n = true;
                    }
                   break;
                   case 's':
                     if(this.sis){
                       if(SKP.s)
                         throw new Error("StreamTokenizr -> cannot authorize skip on a space char");
                       else
                          return;
                    }else{
                         if(SKP.s)
                             return;
                         else
                            SKP.s = true;
                    }
                }
            }
        }

        StreamTokenizr.prototype.setComment = function(cs,ce){
            // code goes here...
        }

        StreamTokenizr.prototype.type = {equals:function(tval, typ){
                    return (typeof(tval.valueOf()) == typ);
        }}

        init(); // initialize... pronto
} 

// -> setup for global access
 window.StreamTokenizr = StreamTokenizr;
