normalQuotedAmount: number | null = null;
  goldQuotedAmount: number | null = null;
  premiumQuotedAmount: number | null = null; 

 calculateQuotesForAllPlans(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.quoteForm.valid) {
        this.alertMessage = 'Please complete all required fields!';
        this.alertType = 'error';
        reject('Form is invalid');
        return;
      }

      const formValue = this.quoteForm.value;
      const plans = ['Normal', 'Gold', 'Premium'];
      let completedCalls = 0;

      plans.forEach((plan) => {
        const quoteDto = new QuoteCalculationDto(
          Number(formValue.annualTurnover),
          Number(formValue.propertyValue),
          formValue.ownershipType!,
          formValue.businessType!,
          formValue.locationType!,
          plan,
          Number(formValue.yearOfOperation),
          Number(formValue.numberOfEmployees),
          formValue.naturalCalamityCoverageNeeded!
        );

        this.ratingService.calculateQuote(quoteDto).subscribe({
          next: (calculated) => {
            if (plan === 'Normal') {
              this.normalQuotedAmount = calculated.quoteAmount;
            } else if (plan === 'Gold') {
              this.goldQuotedAmount = calculated.quoteAmount;
            } else if (plan === 'Premium') {
              this.premiumQuotedAmount = calculated.quoteAmount;
            }

            completedCalls++;

            // // When all plans are calculated, resolve the Promise
            // if (completedCalls === plans.length) {
            //   console.log(`Final Values: Normal=${this.normalQuotedAmount}, Gold=${this.goldQuotedAmount}, Premium=${this.premiumQuotedAmount}`);
            //   resolve(); // Ensures values are ready to use
            // }
          },
          error: (err) => {
            console.error(`Error calculating ${plan} quote from server:`, err);
            reject(err);
          },
        });
      });
    });
  }
i am calcualting therse 3 values in quote form page 
async calculateQuote() {
    await this.calculateQuotesForAllPlans(); // Wait for all plan calculations
      console.log(`Now using values: Normal=${this.normalQuotedAmount}, Gold=${this.goldQuotedAmount}, Premium=${this.premiumQuotedAmount}`);
    if (!this.quoteForm.valid) {
      this.alertMessage = 'Please complete all required fields!';
      this.alertType = 'error';
      return;
    }

    const formValue = this.quoteForm.value;

    // Construct updated Quote DTO including the new fields
    const quoteDto = new QuoteCalculationDto(
      Number(formValue.annualTurnover),
      Number(formValue.propertyValue),
      formValue.ownershipType!,
      formValue.businessType!,
      formValue.locationType!,
      formValue.planType!,
      Number(formValue.yearOfOperation),
      Number(formValue.numberOfEmployees),
      formValue.naturalCalamityCoverageNeeded!
    );

    this.ratingService.calculateQuote(quoteDto).subscribe({
      next: (calculated) => {
        this.quoteAmount = calculated.quoteAmount;
        this.baseRate = calculated.breakdown.baseRate;
        this.businessTypeRate = calculated.breakdown.businessTypeRate;
        this.locationRate = calculated.breakdown.locationRate;
        this.propertyRate = calculated.breakdown.propertyRate;
        this.turnoverComponent = calculated.breakdown.turnoverComponent;
        this.finalRate = calculated.breakdown.finalRate;
        this.experienceRate = calculated.breakdown.experienceRate;
        this.employeeRate = calculated.breakdown.employeeRate;
        this.calamityCoverageRate = calculated.breakdown.calamityCoverageRate;

        this.alertMessage = 'Quote calculated successfully!';
        this.alertType = 'success';
      },
      error: (err) => {
        this.alertMessage = 'Error calculating quote from server.';
        this.alertType = 'error';
        console.error(err);
      },
    });
  }
i want to make a another component that arisies when a user click on a calculate quote amount 
the the fun that is not showing come as same but on add in a dialogue box apper on that age on top of the form that is a seprate componnet 
in this component if the user select normal plan in that dialogue box appers that with this much more spend u can get the gold plan that value comes form goldquotedamount - normalquoted amount and with golid plan u will get this this mroe benifits 
and similar for if gold plan selected but if premium is slected nothing happens 
this dialogue box appers after 10 sec of calculte quote butoon clicked 
for benifits u can refer to terms and condition ts file 
import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


interface PolicyTerms {
  type: string;
  claimPercentage: number;
  description: string;
  extraCoverages?: string[];
}
@Component({
  selector: 'app-terms-and-condition',
  imports: [NgFor,NgIf],
  templateUrl: './terms-and-condition.component.html',
  styleUrl: './terms-and-condition.component.css'
})
export class TermsAndConditionComponent {
  selectedPolicyType: string | null = null;
  naturalCalamityCoverageNeeded: boolean=false;
  policies: PolicyTerms[] = [];
  commonCoverages: string[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.selectedPolicyType = params.get('policyType');
      this.naturalCalamityCoverageNeeded = params.get('naturalCalamityCoverageNeeded')==='true';
      this.loadPolicies();
      this.loadCommonCoverages();
    });
  }

  loadPolicies() {
    const allPolicies: PolicyTerms[] = [
      {
        type: 'Normal',
        claimPercentage: 60,
        description: 'Provides coverage up to 60% of losses incurred due to insured risks such as theft, fire, or natural disasters.'
      },
      {
        type: 'Gold',
        claimPercentage: 80,
        description: 'Offers up to 80% reimbursement on claims for a broader range of damages.',
        extraCoverages: ['Accidental Losses', 'Minor Damage Coverage']
      },
      {
        type: 'Premium',
        claimPercentage: 100,
        description: 'Covers 100% of eligible losses including business interruption and accidental losses.',
        extraCoverages: ['Accidental Losses', 'Minor Damage Coverage', 'Business Interruption']
      }
    ];

    if (this.selectedPolicyType) {
      this.policies = allPolicies.filter(p => p.type === this.selectedPolicyType);
    } else {
      this.policies = allPolicies;
    }
  }

  loadCommonCoverages() {
    this.commonCoverages = [
      'Property Damage',
      'Third-Party Liability',
      'Theft and Burglary',
      'Equipment Breakdown',
      'Public Liability',
      'Employee Compensation'
    ];
    if(this.naturalCalamityCoverageNeeded){
      this.commonCoverages.push('Natural Disaster');
    }
  }
}


u can see the benifits here so it in a good ui way 
.terms-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 30px;
    margin-left: 60px; 
    margin-top: 85px; 
  }
  
  .card {
    padding: 25px;
    color: #ffffff;
    border-radius: 12px;
    background-color: #0A0A0A;
    border: 1px solid #ccc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  h2, h3 {
    color: #9ca3af;
    margin-top: 0;
  }
  
  .card-section {
    margin-top: 20px;
  }
  
  .coverage-card {
    border: 1px solid #333333;
    border-radius: 8px;
    background-color: #1F2937;
    padding: 12px;
    margin: 8px 0;
    color: #ffffff;
}
.coverage-card:Hover {
    background-color: #293549;
    color: #ffffff;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  
  .coverage-card.premium {
    background-color: #9ca3af;
  }
  
  .footer-note {
    margin-top: 25px;
    font-style: italic;
  }
  
  .highlight {
    color: #2b6cb0;
    font-weight: 600;
  }
the css of the dialgue box should be like this css that is t&c file css 
