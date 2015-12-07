/**
 * Created by Poka on 12/5/2015.
 */


//noinspection TypeScriptCheckImport
import{Component, View,bootstrap} from 'angular2/angular2'

//noinspection TypeScriptCheckImport
import{ROUTER_DIRECTIVES,RouteConfig} from 'angular2/router'        //ROUTER_DIRECTIVES need for router-link, <router-outlet>
import {AboutCmp} from '../about/about'
import {HomeCmp} from '../home/home'

@Component({
    selector: 'app',
    templateUrl: './components/app/app.html',
    directives: [ROUTER_DIRECTIVES]
})

@RouteConfig([
    {path: '/', component: HomeCmp, as: 'Home'},
    {path: '/about', component: AboutCmp, as: 'About'},
    {path: '/home', component: HomeCmp, as: 'Home'}
])

export class AppCmp {

}

