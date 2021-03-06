import { FormControl, FormGroup } from '@angular/forms'; 

// SINGLE FIELD VALIDATORS
export function emailValidator(control: FormControl): {[key: string]: any} {
  var emailRegexp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  if (control.value && !emailRegexp.test(control.value)) {
    return { invalidEmail: true };
  }
}

export function isNumeric(control: FormControl): {[key: string]: any} {
  if (control.value && isNaN(control.value)) {
    return { invalidNumber: true }
  }
}


// FORM GROUP VALIDATORS
export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): {[key: string]: any} => {
    let password = group.controls[passwordKey];
    let confirmPassword = group.controls[confirmPasswordKey];
    
    if (password.value !== confirmPassword.value) {
      return {
        mismatchedPasswords: true
      };
    }
  }
}

// not working as expected
export function notEmptyArrayValidator(control: FormControl): {[key: string]: any} {
  console.log(control.value.length > 0);
 if (control.value instanceof Array && control.value.length > 0) {
    return { invalidArray: true }
  }
}
