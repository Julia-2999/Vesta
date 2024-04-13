import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../../shared/services/auth.service";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPassForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.createforgotPassForm();
  }

  createforgotPassForm() {
    this.forgotPassForm = this.fb.group({
      userName: [null, null]
    })
  }


  onSubmit(loginForm: UntypedFormGroup) {
    this.authService.ForgotPassword(this.userName.value);
}


  get userName() {
    return this.forgotPassForm.get('userName') as UntypedFormControl;
  }

}
