import { Component, OnInit } from '@angular/core';
import {Product} from "../model/product.model";
import {ProductService} from "../services/product.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {AuthentificationService} from "../services/authentification.service";
import {Router} from "@angular/router";



@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products!: Array<Product>; /* ! est utilisé pour indiquer au compilateur d'ignorer la possibilité qu'elle soit indéfinie.*/
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  errorMessage!: string;
  searchFormGroup!: FormGroup;
  currentAction: String = "All";

  constructor(private productService: ProductService,
              private fb: FormBuilder,
              public authService: AuthentificationService,
              private router: Router) {

  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control(null)
    });
    this.handleGetPageProducts();
  }

  handleGetPageProducts() {
    this.productService.getPageProducts(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.products = data.products;
        this.totalPages = data.totalPages;
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });
  }

  handleGetAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });
  }

  handleDeleteProduct(p: Product) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;
    this.productService.deleteProduct(p.id).subscribe({
      next: (data) => {
        //this.handleGetAllProducts();
        let index = this.products.indexOf(p); // est utilisé pour que si je veux supprimer qlq chose je vais lui supprimer du backend et le supprimer aussi du front et non pas redemander la nouvelle liste depuis le backend
        this.products.splice(index, 1);
      }
    });
  }

  handleSetPromotion(p: Product) {
    let promo = p.promotion;
    this.productService.setPromotion(p.id).subscribe({
      next: (data) => {
        p.promotion = !promo;
      },
      error: err => {
        this.errorMessage = err;
      }
    });
  }

  handleSearchProducts() {
    this.currentAction = "Search";
    this.currentPage=0;
    let keyword = this.searchFormGroup.value.keyword;
    this.productService.searchProduct(keyword, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.products = data.products;
        this.totalPages = data.totalPages;
      }

    })
  }

  gotoPage(i: number) {
    this.currentPage = i;
    if (this.currentAction == "All")
      this.handleGetPageProducts();
    else
      this.handleSearchProducts();

  }

  handleNewProduct() {
    this.router.navigateByUrl('/admin/newProduct');
  }

  handleEditProduct(p: Product) {
    this.router.navigateByUrl('/admin/editProduct/'+p.id);
  }

}
