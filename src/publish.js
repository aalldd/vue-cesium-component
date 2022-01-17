import Vue from "vue";

const requireComponent=require.context(
    "./components",
    true,
    /\w+\.vue$/
)

let components={}
requireComponent.keys().forEach(fileName => {
    let cmp=requireComponent(fileName);
    const reqComName=fileName.split('/')[1]
    Vue.component(reqComName,cmp.default || cmp)
    components[reqComName]=cmp
});

console.log(components);

export default {
    components
}