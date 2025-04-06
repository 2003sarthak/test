import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { AlertComponent } from '../../shared/Components/alert/alert.component';
import { UserServiceService } from '../../Services/User.Service/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote',
  imports: [NgIf,AlertComponent,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.css',
  standalone:true,
})
export class QuoteComponent {
  constructor(private userService: UserServiceService, private router: Router) { }
  step = 1;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  submittedQuote: any = null;
  submittedQuotes: any[] = JSON.parse(localStorage.getItem('submittedQuotes') || '[]');
  loggedInUser: any = null;

  ngOnInit(): void {
    const user = this.userService.getLoggedInUser();
    if (!this.userService.getLoggedInUser()) {
      this.router.navigate(['/login']);
    }else {
      this.loggedInUser = user; 
    }

  }

  // Define the form group with all controls
  quoteForm = new FormGroup({
    businessName: new FormControl('', Validators.required),
    GSTNo:new FormControl('',[Validators.minLength(15),Validators.maxLength(15)]),
    annualTurnover: new FormControl('', [Validators.required, Validators.min(10000)]),
    businessType: new FormControl('Retail', Validators.required),
    propertyValue: new FormControl('', Validators.required),
    ownershipType: new FormControl('Owned', Validators.required),
    locationType: new FormControl('Urban', Validators.required),
    securitySystem: new FormControl(''),
    previousClaims: new FormControl(''),
    planType: new FormControl('Normal', Validators.required),
  });

  // Variables for displaying breakdown in the summary
  baseRate = 0.005;
  businessTypeRate = 0;
  propertyRate = 0;
  propertyPer = 0;
  locationRate = 0;
  finalRate = 0;
  finalValue = 0;

  // Step Navigation Methods
  nextStep() {
    if (this.step === 1 && this.quoteForm.controls['businessName'].valid && this.quoteForm.controls['annualTurnover'].valid) {
      this.step++;
    } else if (this.step === 2 && this.quoteForm.controls['propertyValue'].valid) {
      this.step++;
    } else {
      this.alertMessage = 'Please fill in all required fields!';
      this.alertType = 'error';
    }
  }

  prevStep() {
    this.step--;
  }

  // Quote Calculation
  calculateQuote() {
    this.baseRate = 0.005; // 0.1%

    // Plan type adjustment
    switch (this.quoteForm.value.planType) {
      case 'Gold':
        this.baseRate = 0.01;
        break;
      case 'Premium':
        this.baseRate = 0.015;
        break;
    }

    // Business type adjustment
    switch (this.quoteForm.value.businessType) {
      case 'Retail':
        this.businessTypeRate = 0.0025;
        break;
      case 'Manufacturing':
        this.businessTypeRate = 0.005;
        break;
      case 'High Risk':
        this.businessTypeRate = 0.0075;
        break;
    }

    // Property value adjustment
    this.propertyPer= 0.0005; 
    if (this.quoteForm.value.ownershipType === 'Owned') {
      this.propertyPer += 0.00025; 
    } else if (this.quoteForm.value.ownershipType === 'Rented') {
      this.propertyPer -= 0.00025;
    }
    this.propertyRate = Number(this.quoteForm.value.propertyValue)*this.propertyPer ;

    // Location type adjustment
    switch (this.quoteForm.value.locationType) {
      case 'Urban':
        this.locationRate = 0.0025;
        break;
      case 'Semiurban':
        this.locationRate = 0.005;
        break;
      case 'Rural':
        this.locationRate = 0.0075;
        break;
    }

    // Calculate final rate
    this.finalRate =
      this.baseRate + this.businessTypeRate + this.locationRate;
    
    this.finalValue=Math.round(Number(this.quoteForm.value.annualTurnover) * this.finalRate);

    // Calculate the quote
    return this.finalValue + this.propertyRate;
  }

  submitQuote() {
    if (this.quoteForm.valid) {
      const currentDate = new Date(); 
      const id = `Q-2025-${this.submittedQuotes.length + 1}`;
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const brokerIndex = users.findIndex((user: any) => user.fullName === this.loggedInUser.fullName);
      const brokerId = `Bro00${brokerIndex}`;
      const brokerName = this.loggedInUser.fullName;
      
      this.submittedQuote = {
        ...this.quoteForm.value,
        quoteAmount: this.calculateQuote(),
        status: false, 
        createdAt: currentDate.toISOString(), 
        id: id,
        brokerName: brokerName,
        brokerId: brokerId,
      };
      const newQuote = {
        ...this.quoteForm.value,
        quoteAmount: this.calculateQuote(),
        status: false, 
        createdAt: currentDate.toISOString(),
        id: id,
        brokerName: brokerName,
        brokerId: brokerId,
      };
      this.submittedQuotes.push(newQuote);
      localStorage.setItem('submittedQuotes', JSON.stringify(this.submittedQuotes));
      this.alertMessage = 'Quote submitted successfully!';
      this.alertType = 'success';
      //reset the form 
      this.quoteForm.reset();
      this.step = 1; 
    } else {
      this.alertMessage = 'Please complete all required fields!';
      this.alertType = 'error';
    }
  }

}



export class QuoteCalculationDto {
    annualTurnover: number;
    propertyValue: number;
    ownershipType: string; // Expected values: "Owned" or "Rented"
    businessType: string;  // Expected values: "Retail", "Manufacturing", "High Risk", etc.
    locationType: string;  // Expected values: "Urban", "Semiurban", "Rural", etc.
    planType: string;      // Expected values: "Gold", "Premium", etc.
  
    constructor(
      annualTurnover: number,
      propertyValue: number,
      ownershipType: string,
      businessType: string,
      locationType: string,
      planType: string
    ) {
      this.annualTurnover = annualTurnover;
      this.propertyValue = propertyValue;
      this.ownershipType = ownershipType;
      this.businessType = businessType;
      this.locationType = locationType;
      this.planType = planType;
    }
  }

export interface Quote {
  id: string;
  brokerName: string;
  brokerId: string;
  businessName: string;
  GSTNo:string;
  annualTurnover: number;
  propertyType: string;
  propertyValue: number;
  ownershipType: string;
  businessType: string;
  locationType: string;
  securitySystem: string;
  previousClaims: string;
  securityMeasures: boolean;
  planType: 'Normal' | 'Gold' | 'Premium';
  quoteAmount: number;
  status: boolean;
  created: Date;
}

export class RatingService {
  private apiBaseUrl = 'http://localhost:5111/api/Rating'; 

  constructor(private http: HttpClient) {}

  calculateQuote(quote: QuoteCalculationDto): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/calculate`, quote);
  }

}

export class QuoteService {
  private apiBaseUrl = 'http://localhost:5111/api/Quotes'; // Replace with your backend API's URL

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const email = loggedInUser.email || '';
    const brokerId = loggedInUser.brokerId || '';
    const brokerName = loggedInUser.brokerName || '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'userEmail': email,
      'brokerId': brokerId,
      'brokerName': brokerName
    });
  }

  getQuotes(): Observable<Quote[]> {
    return this.http.get<Quote[]>(`${this.apiBaseUrl}/list`, { headers: this.getHeaders() });
  }

  getQuoteById(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiBaseUrl}/get/${id}`, { headers: this.getHeaders() });
  }

  createQuote(quote: Quote): Observable<Quote> {
    return this.http.post<Quote>(`${this.apiBaseUrl}/create`, quote, { headers: this.getHeaders() });
  }

  editQuote(id: number, quote: Quote): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/edit/${id}`, quote, { headers: this.getHeaders() });
  }

  deleteQuote(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/delete/${id}`, { headers: this.getHeaders() });
  }

}



import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { AlertComponent } from '../../shared/Components/alert/alert.component';
import { UserServiceService } from '../../Services/User.Service/user-service.service';
import { Router } from '@angular/router';
import { QuoteService } from '../../Services/Quote.Service/quote.service';
import { RatingService } from '../../Services/Rating.Service/rating.service';
import { HttpClientModule } from '@angular/common/http';
import { QuoteCalculationDto } from '../../Models/quote-calculation.dto';
import { Quote } from '../../Models/quote.model';

@Component({
  selector: 'app-quote',
  imports: [NgIf, AlertComponent, FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.css',
  standalone: true,
})
export class QuoteComponent {
  constructor(
    private userService: UserServiceService,
    private router: Router,
    private quoteService: QuoteService,
    private ratingService: RatingService
  ) {}

  step = 1;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  submittedQuote: Quote | null = null;
  loggedInUser: any = null;

  ngOnInit(): void {
    const user = this.userService.getLoggedInUser();
    if (!user) {
      this.router.navigate(['/login']);
    } else {
      this.loggedInUser = user;
    }
  }

  quoteForm = new FormGroup({
    businessName: new FormControl('', Validators.required),
    GSTNo: new FormControl('', [Validators.minLength(15), Validators.maxLength(15)]),
    annualTurnover: new FormControl('', [Validators.required, Validators.min(10000)]),
    businessType: new FormControl('Retail', Validators.required),
    propertyValue: new FormControl('', Validators.required),
    ownershipType: new FormControl('Owned', Validators.required),
    locationType: new FormControl('Urban', Validators.required),
    securitySystem: new FormControl(''),
    previousClaims: new FormControl(''),
    planType: new FormControl('Normal', Validators.required),
  });

  // Step navigation
  nextStep() {
    if (this.step === 1 && this.quoteForm.controls['businessName'].valid && this.quoteForm.controls['annualTurnover'].valid) {
      this.step++;
    } else if (this.step === 2 && this.quoteForm.controls['propertyValue'].valid) {
      this.step++;
    } else {
      this.alertMessage = 'Please fill in all required fields!';
      this.alertType = 'error';
    }
  }

  prevStep() {
    this.step--;
  }

  // Submit quote using backend calculation and quote services
  submitQuote() {
    if (!this.quoteForm.valid || !this.loggedInUser) {
      this.alertMessage = 'Please complete all required fields!';
      this.alertType = 'error';
      return;
    }

    const formValue = this.quoteForm.value;

    const quoteDto = new QuoteCalculationDto(
      Number(formValue.annualTurnover),
      Number(formValue.propertyValue),
      formValue.ownershipType!,
      formValue.businessType!,
      formValue.locationType!,
      formValue.planType!
    );

    this.ratingService.calculateQuote(quoteDto).subscribe({
      next: (calculated) => {
        const newQuote: Quote = {
          id: '', // Will be set by backend
          brokerName: this.loggedInUser.fullName,
          brokerId: this.loggedInUser.brokerId || `Bro00${this.loggedInUser.index || 1}`,
          businessName: formValue.businessName!,
          GSTNo: formValue.GSTNo!,
          annualTurnover: Number(formValue.annualTurnover),
          propertyType: '', // Not in form, keep empty or update accordingly
          propertyValue: Number(formValue.propertyValue),
          ownershipType: formValue.ownershipType!,
          businessType: formValue.businessType!,
          locationType: formValue.locationType!,
          securitySystem: formValue.securitySystem!,
          previousClaims: formValue.previousClaims!,
          securityMeasures: false, // Add actual logic if needed
          planType: formValue.planType as 'Normal' | 'Gold' | 'Premium',
          quoteAmount: calculated.quoteAmount,
          status: false,
          created: new Date(),
        };

        this.quoteService.createQuote(newQuote).subscribe({
          next: (response) => {
            this.submittedQuote = response;
            this.alertMessage = 'Quote submitted successfully!';
            this.alertType = 'success';
            this.quoteForm.reset();
            this.step = 1;
          },
          error: (err) => {
            this.alertMessage = 'Error submitting quote to server.';
            this.alertType = 'error';
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.alertMessage = 'Error calculating quote from server.';
        this.alertType = 'error';
        console.error(err);
      }
    });
  }
}

