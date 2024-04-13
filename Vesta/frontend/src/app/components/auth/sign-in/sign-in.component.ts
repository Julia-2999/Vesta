import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from "../../../shared/services/auth.service";


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  loginForm!: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.fb.group({
      userName: [null, Validators.required],
      userPassword: [null, Validators.required]
    })
  }


  onLogin() {
    this.authService.SignIn(this.userName.value, this.userPassword.value);
  }

  get userName() {
    return this.loginForm.get('userName') as UntypedFormControl;
  }

  get userPassword() {
    return this.loginForm.get('userPassword') as UntypedFormControl;
  }

}



