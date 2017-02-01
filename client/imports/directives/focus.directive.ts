// Simple 'focus' Directive
import {Component, Inject, Directive, Input, ElementRef} from '@angular/core';

@Directive({
    selector: '[focus]'
})
export class FocusDirective {
    @Input()
    focus:boolean;
    constructor(@Inject(ElementRef) private element: ElementRef) {}
    protected ngOnChanges() {
        this.element.nativeElement.focus();
    }
} 