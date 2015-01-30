
/* description: Parses and executes mathematical expressions. */

/* lexical grammar */
%lex
%x string string2
%%

// [0-9]+("."[0-9]+)?\b  return 'NUMBER'
// "'"                                     this.begin('string2');
// <string2>"'"                            this.popState();
// <string2>(\\\'|[^'])*                   { return 'STRING'; }

\s+                   /* skip whitespace */
"&&"                return '&&'
"and"               return '&&'
"et"                return '&&'
"||"                return '||'
"or"                return '||'
"et"                return '||'
"("                 return '('
")"                 return ')'
":"                 return ':'
'"'                                     this.begin('string');
<string>'"'                             this.popState();
<string>(\\\"|[^"])*                    { return 'STRING'; }
"'"                                     this.begin('string2');
<string2>"'"                            this.popState();
<string2>(\\'|[^'])*                    { return 'STRING'; }
[^\s|&:()]+                             return 'TOKEN'
<<EOF>>                                 return 'EOF'
.                                       return 'INVALID'

/lex

/* operator associations and precedence */

%left '&&'
%left '||'
%left ':'
//%left UMINUS

%start expressions

%% /* language grammar */

//    | '-' e %prec UMINUS
//        {$$ = -$2;}

expressions
    : e EOF
        { typeof console !== 'undefined' ? console.log('parsed', $1) : print('parsed', $1);
          return $1; }
    ;

e: 
    | e '&&' e          {$$ = {'type': 'and', 'expressions': [$1,$3]};}
    | e '||' e          {$$ = {'type': 'or', 'expressions': [$1,$3]};}
    | '(' e ')'         {$$ = $2;}
    | key ':' value     {$$ = {'type': 'filter', 'key': $1, 'value': $3};}
    | TOKEN             {$$ = {'type': 'string', 'value': yytext};}
    | TOKEN TOKEN       {$$ = {'type': 'strings', 'value': [$1, $2]};}
    | STRING            {$$ = {'type': 'string', 'value': yytext};}
    | STRING STRING     {$$ = {'type': 'strings', 'value': [$1, $2]};}
    ;

key : 
    | TOKEN { $$ = yytext }
    ;

value:
    | TOKEN  { $$ = yytext }
    | STRING { $$ = yytext }
    ;

