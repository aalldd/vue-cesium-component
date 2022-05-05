const funMixin={
  data(){
    return {
      panelVisible:true
    }
  },
  methods:{
    onClose(){
      this.panelVisible=false
      this.$router.replace('/')
    }
  }
}

export default funMixin
