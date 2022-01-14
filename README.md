# Angular Runtime Configuration

Existen aplicaciones que necesitan algún tipo de información de configuración en tiempo de ejecución, que debe cargarse al inicio o la posibilidad de modificar alguna propiedad de esa configuración sin la necesidad de recompilar. En este repo se cubre cómo leer un archivo de configuración en angular usando [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) en tiempo de ejecución.

## Donde almacenar la configuración?

Angular tiene las variables de entorno, donde puede mantener la configuración, pero tiene limitaciones. La configuración de las variables de entorno se define en el momento de la compilación y no se puede cambiar en el momento de la ejecución.

El enfoque correcto es almacenar la información de configuración en un archivo de configuración en una ubicación segura. Implementaremos el archivo de configuración junto con la aplicación. La aplicación puede cargar la configuración desde ella cuando se carga.

En este caso, lo guardaremos en la carpeta `src/app/assets/json/` y creamos un archivo json `config.json`, con esta estructura (puede agregar al objeto las propiedades que crea necesarias, tales como api_keys, credenciales, etc):

```json
{
  "env": "local",
  "url_server": "https://pokeapi.co/api/v2/pokemon"
}
```

## Donde leer la configuración

Angular proporciona el token de inyección denominado [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER), que se ejecuta cuando se inicia la aplicación. Por lo tanto, haremos uso de el.

#### APP_INITIALIZER

`APP_INITIALIZER` es el token de inyección predefinido. Por ende, Angular ejecutará la función proporcionada por este token cuando se cargue la aplicación. Esto lo convierte en un lugar ideal para leer la configuración y también para realizar alguna lógica de inicialización antes de inicializar la aplicación.

Para usar `APP_INITIALIZER` primero, debemos importarlo en nuestro módulo raíz:

```js
import { NgModule, APP_INITIALIZER } from "@angular/core";
```

A continuación, necesitamos crear un servicio, que se encargue de leer el archivo de configuración. Lo creamos y lo llamamos `AppConfigService`:

```js
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  static settings: IAppConfig;
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  load() {
    const jsonFile = 'assets/json/config.json';

    return new Promise<void>((resolve, reject) => {
      this.httpClient
        .get(jsonFile)
        .toPromise()
        .then((response) => {
          AppConfigService.settings = <IAppConfig>response;
          resolve();
        })
        .catch((response: any) => {
          reject(`Could not load the config file`);
        });
    });
  }
}
```

Luego, creamos un método de fábrica en `app.module`, que llame al método de carga de `AppConfigService`.

```js
export function initializeApp(appConfigService: AppConfigService) {
  return (): Promise<any> => {
    return appConfigService.load();
  };
}
```

Finalmente, agregamos el token `APP_INITIALIZER` como provider en `app.module` usando `useFactory`. Usamos como dependencia (deps) AppConfigService ya que `initializeApp` usa ese servicio. El `multi: true` nos permite agregar más de un proveedor al token `APP_INITIALIZER`.

```js
providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService],
      multi: true,
    },
  ],
```

## Leer la configuración en componentes

Para leer la configuración, a modo de ejemplo, creamos un nuevo servicio `app.service` que haga un request a una api (esta api estara establecida en el config.json) y luego el componente `app.component` invocara ese metodo.

```js
@Injectable({
  providedIn: 'root',
})
export class AppService {
  protected apiServer = AppConfigService.settings.url_server;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http
      .get(this.apiServer)
      .pipe(map((res: any) => res['results']));
  }
}
```

```js
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  results: any[] = [];

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.getAll().subscribe((res) => {
      this.results = res;
    });
  }
}
```

---

⭐️ From [@dromeroDev](https://github.com/dromeroDev)
