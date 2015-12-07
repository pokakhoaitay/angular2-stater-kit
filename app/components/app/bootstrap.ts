import{bootstrap, provide} from 'angular2/angular2'
//noinspection TypeScriptCheckImport
import {AppCmp} from "./app";
import{ROUTER_PROVIDERS, APP_BASE_HREF,LocationStrategy,HashLocationStrategy,PathLocationStrategy} from 'angular2/router'

//noinspection TypeScriptValidateTypes
bootstrap(AppCmp, [
    ROUTER_PROVIDERS, //NOTE: Rememner !! It's need for router
    provide(APP_BASE_HREF, { useValue: '/' } ),
    provide(LocationStrategy, {useClass: HashLocationStrategy})
    //NOTE: Use PathLocationStrategy when F5 cause page error, this is a bug will be fix in beta, releae. Checkout here: https://github.com/mgechev/angular2-seed/issues/264
]);
//.then(success=>console.log(success), error=>console.log(error));