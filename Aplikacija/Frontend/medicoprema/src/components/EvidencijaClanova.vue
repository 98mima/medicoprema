<template>
    <div class="evidencija-clanova-container">
        <div class="evidencija-clanova">
            <filter-clanova hidden></filter-clanova>
            <div id="select">
                <div style="flex:1"></div>
                <h5 style="text-align:center; font-family:'Times New Roman', Times, serif; flex:1">Evidencija članova</h5>
                <div class="select-container" style="display:flex; flex:1; justify-content:flex-end;">
                    <el-select :value="user" @change="setUSer($event)">
                        <el-option :value="'/'"></el-option>
                        <el-option :value="'Zaposleni'">Zaposleni</el-option>
                        <el-option :value="'Korisnik'" >Korisnik</el-option>
                    </el-select>
                </div>
            </div>
            <el-table style="width:100%" :data="tableData.filter(data => !search || data.FirstName.toLowerCase().includes(search.toLowerCase()))">
                <el-table-column prop="FirstName" label="Ime" class="table-column"></el-table-column>
                <el-table-column prop="LastName" label="Prezime" class="table-column"></el-table-column>
                <el-table-column prop="UserType" label="Tip" class="table-column"></el-table-column>
                <el-table-column prop="UserName" label="Korisničko ime" class="table-column"></el-table-column>
                <el-table-column align="right">
                    <template slot="header" slot-scope="scope">
                        <el-input v-model="search" style="margin:0" size="big" placeholder="Ime za pretragu" :focus="scope.search">
                        </el-input>
                    </template>
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.UserType == userTypes[employedUserType]" size="mini" type="danger" @click="deleteUser(scope.row.Id)">
                            Obriši
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="dugme-dodaj">
                <el-button round size="mini" style="height:50px; width:130px; color:white; margin-right:5px; border-color:rgba(24, 102, 89, 0.925); background-color:rgba(24, 102, 89, 0.925);" @click="dodajClana"> Dodaj zaposlenog </el-button>
            </div>
        </div>
        <form-dodaj-zaposlenog v-if="this.showComp == 'zaposleni'" @zatvoriDodavanjeClana="zavrsiDodavanje"></form-dodaj-zaposlenog>
    </div>
</template>

<script>
import FilterClanova from './FilterClanova'
import FormDodajZaposlenog from './forme/FormDodajZaposlenog'
import { } from 'element-ui'
import { setPageShown } from '../services/contextManagement';
import { apiFetch, destinationUrl, UserTypes, EMPLOYED_USER_TYPE, REGULAR_USER_TYPE } from '../services/authFetch';
export default {
    components:{FilterClanova,FormDodajZaposlenog},
    data(){
        return{
            tableData:[],
            showComp:'',
            search:'',
            employedUserType:EMPLOYED_USER_TYPE,
            userTypes:UserTypes,
            user:''
        }
    },
    methods:{
        dodajClana:function(){
            this.showComp='zaposleni';
            setPageShown('zaposleni');
        },
        deleteUser(id){
            apiFetch('POST', destinationUrl+"/User/DeleteUserById?id=" + id)
                .then(result=>{
                    if(result.Success){
                        this.$message("Korisnik je uspešno obrisan!");
                        this.$emit("loadDataTable");
                    }
                }).catch(error=>{console.log(error);})
        },
        zavrsiDodavanje(){
            this.showComp='';
            this.loadDataTable();
        },
        loadDataTable(){
            apiFetch('GET',destinationUrl+"/User/GetAllUsers")
                .then(result=>{
                    this.tableData=result.Data;
                    this.tableData.forEach((data,index)=>{
                        data.UserType = UserTypes[result.Data[index].UserType];
                    });
                });
        },
        setUser(event){
            this.user=event;

            if(this.user==UserTypes[EMPLOYED_USER_TYPE]){
                apiFetch('GET', destinationUrl+"/User/GetAllEmployed")
                    .then(result=>{
                        this.handleResponse(result);
                    });
            }
            else if(this.user==UserTypes[REGULAR_USER_TYPE]){
                apiFetch('GET', destinationUrl + "/User/GetAllRegularUsers")
                        .then(result => {
                            this.handleResponse(result);
                        });
            }
            else {
                apiFetch('GET', destinationUrl + "/User/GetAllUsers")
                    .then(result => {
                        this.handleResponse(result);
                    });
            }
        },
        handleResponse(result){
            if(result.Success){
                this.tableData=result.Data;
                this.tableData.forEach((data,index)=>{
                    data.UserType=UserTypes[result.Data[index].UserType];
                });
            }
            else
                this.$message({message: "Došlo je do greške!", type: 'error'})
        }
    },
    mounted:function(){
        this.$emit('loadDataTable');
    },
    created(){
        this.$on('loadDataTable', this.loadDataTable);
    }
}
</script>

<style scoped>
    #select{
        display:flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    .evidencija-clanova-container{
        display: flex;
        height: 100%;
        width: 100%;
        justify-content: center;
        align-items: center;
    }
    .evidencija-clanova{
        height: 85%;
        width: 90%;
        display: flex;
        flex-direction: column;
        background-color: rgba(206, 231, 230, 0.986);
        opacity: 1;
        padding: 1em;
    }
    .dugme-dodaj{
        display: flex;
        justify-content: center;
        padding-top: 10px;
    }
    .el-table {
        margin-bottom: 15px;
        width: 100%;
    }
    
    @media screen and (max-width: 700px) {
        .evidencija-clanova {
            height: 100%;
            width: 100%;
            padding: 0.5em;
        }
    }
</style>