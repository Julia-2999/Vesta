import { Component, HostListener } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'Vesta';

  constructor(public authService: AuthService) { }


  @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    this.authService.SignOut();
  }
}
